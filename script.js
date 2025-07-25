const HARGA = { RO: 12000, BIASA: 6000, WARUNG: 5000 };
const ONGKIR = 2000;

let data = JSON.parse(localStorage.getItem("data")) || [];
let bensin = Number(localStorage.getItem("bensin")) || 0;

function updateWaktu() {
  document.getElementById("waktu").textContent = new Date().toLocaleString("id-ID");
}
setInterval(updateWaktu, 1000);

function pindahHalaman(id) {
  document.querySelectorAll(".halaman").forEach(s => s.classList.remove("aktif"));
  document.getElementById(id).classList.add("aktif");
  if (id === "orderan") tampilkanDaftarPesanan();
  if (id === "hasil") tampilkanRingkasan();
}

function tambahPesanan() {
  const nama = document.getElementById("nama").value;
  const jumlah = Number(document.getElementById("jumlah").value);
  const jenis = document.getElementById("jenis").value;
  const ket = document.getElementById("keterangan").value;
  if (!nama || !jumlah) return alert("Lengkapi data");

  const waktu = new Date().toLocaleString("id-ID");
  data.push({ waktu, nama, jumlah, jenis, ket, status: "Dalam Antrian", pengantar: "K1" });
  localStorage.setItem("data", JSON.stringify(data));
  alert("✅ Pesanan telah dimasukkan ke daftar tunggu");

  document.getElementById("nama").value = "";
  document.getElementById("jumlah").value = "";
}

function tampilkanDaftarPesanan() {
  const tbody = document.querySelector("#tabelOrderan tbody");
  tbody.innerHTML = "";

  const karyawan = ambilNamaKaryawan();

  data.forEach((item, i) => {
    const hargaSatuan = item.ket === "WARUNG" ? HARGA.WARUNG : HARGA[item.jenis];
    const ongkir = item.ket === "DELIVERY" ? ONGKIR : 0;
    const total = item.jumlah * hargaSatuan + ongkir;

    const tr = document.createElement("tr");
    if (item.status === "Selesai") tr.classList.add("selesai");

    tr.innerHTML = `
      <td>${item.waktu}</td>
      <td>${item.nama}</td>
      <td>${item.jenis}</td>
      <td>${item.jumlah}</td>
      <td>${item.ket}</td>
      <td>Rp${hargaSatuan.toLocaleString()}</td>
      <td>Rp${total.toLocaleString()}</td>
      <td>
        <select onchange="ubahStatus(${i}, this.value)">
          <option${item.status === "Dalam Antrian" ? " selected" : ""}>Dalam Antrian</option>
          <option${item.status === "Selesai" ? " selected" : ""}>Selesai</option>
        </select>
      </td>
      <td>
        <select onchange="ubahPengantar(${i}, this.value)">
          ${Object.keys(karyawan).map(k => `<option value="${k}"${item.pengantar === k ? " selected" : ""}>${karyawan[k]}</option>`).join("")}
        </select>
      </td>
      <td><button onclick="hapus(${i})">🗑️</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function ubahStatus(i, val) {
  data[i].status = val;
  localStorage.setItem("data", JSON.stringify(data));
  tampilkanDaftarPesanan();
}

function ubahPengantar(i, val) {
  data[i].pengantar = val;
  localStorage.setItem("data", JSON.stringify(data));
}

function hapus(i) {
  if (confirm("Hapus pesanan ini?")) {
    data.splice(i, 1);
    localStorage.setItem("data", JSON.stringify(data));
    tampilkanDaftarPesanan();
  }
}

function tampilkanRingkasan() {
  const ringkasan = document.getElementById("ringkasan");
  const karyawan = ambilNamaKaryawan();
  const selesai = data.filter(d => d.status === "Selesai");

  const totalGalon = { RO: 0, BIASA: 0, WARUNG: 0 };
  const gaji = { K1: 0, K2: 0, K3: 0, K4: 0 };
  const jumlahAntar = { K1: 0, K2: 0, K3: 0, K4: 0 };
  let bruto = 0;

  selesai.forEach(d => {
    if (d.ket === "WARUNG") totalGalon.WARUNG += d.jumlah;
    else totalGalon[d.jenis] += d.jumlah;

    const harga = d.ket === "WARUNG" ? HARGA.WARUNG : HARGA[d.jenis];
    const ongkir = d.ket === "DELIVERY" ? ONGKIR : 0;

    bruto += d.jumlah * harga + ongkir;

    if (d.ket === "DELIVERY") {
      gaji[d.pengantar] += ONGKIR;
      jumlahAntar[d.pengantar]++;
    }
  });

  const totalGalonAll = totalGalon.RO + totalGalon.BIASA + totalGalon.WARUNG;
  const netto = bruto - Object.values(gaji).reduce((a, b) => a + b, 0) - bensin;

  ringkasan.innerHTML = `
    <h3>1. Total Galon Terjual</h3>
    <ul>
      <li>RO: ${totalGalon.RO}</li>
      <li>Biasa: ${totalGalon.BIASA}</li>
      <li>Warung: ${totalGalon.WARUNG}</li>
      <li><strong>Total: ${totalGalonAll}</strong></li>
    </ul>

    <h3>2. Gaji Karyawan</h3>
    <ul>
      ${Object.keys(karyawan).map(k => `<li>${karyawan[k]}: Rp${gaji[k].toLocaleString()} (${jumlahAntar[k]} order)</li>`).join("")}
    </ul>

    <h3>3. Pengeluaran Bensin</h3>
    <p>Rp${bensin.toLocaleString()}</p>

    <h3>4. Total Pemasukan Hari Ini</h3>
    <p>Rp${netto.toLocaleString()}</p>
  `;
}

function tambahBensin() {
  bensin = Number(document.getElementById("bensin").value);
  localStorage.setItem("bensin", bensin);
  tampilkanRingkasan();
}

function resetData() {
  if (confirm("⚠️ Yakin reset semua data?")) {
    data = [];
    bensin = 0;
    localStorage.removeItem("data");
    localStorage.removeItem("bensin");
    tampilkanDaftarPesanan();
    tampilkanRingkasan();
    document.getElementById("bensin").value = 0;
  }
}

function simpanNamaKaryawan() {
  const karyawan = {
    K1: document.getElementById("k1").value || "Karyawan 1",
    K2: document.getElementById("k2").value || "Karyawan 2",
    K3: document.getElementById("k3").value || "Karyawan 3",
    K4: document.getElementById("k4").value || "Karyawan 4",
  };
  localStorage.setItem("namaKaryawan", JSON.stringify(karyawan));
  tampilkanDaftarPesanan();
  tampilkanRingkasan();
  alert("✅ Nama karyawan disimpan!");
}

function ambilNamaKaryawan() {
  return JSON.parse(localStorage.getItem("namaKaryawan")) || {
    K1: "Karyawan 1",
    K2: "Karyawan 2",
    K3: "Karyawan 3",
    K4: "Karyawan 4"
  };
}

document.addEventListener("DOMContentLoaded", () => {
  updateWaktu();
  document.getElementById("simpanKaryawan").addEventListener("click", simpanNamaKaryawan);
  document.getElementById("bensin").value = bensin;
});
