let dataSoalSaatIni = null;
let jawabanTerpilih = null;
let isFetching = false;

// Ganti URL ini dengan URL backend setelah di-deploy (misal: https://mathtrans.onrender.com)
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://GANTI-DENGAN-URL-BACKENDMU.onrender.com';

async function fetchSoalDariAI() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/generate-soal`);

        if (!response.ok) {
            throw new Error("Jaringan bermasalah atau server mati");
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Gagal mengambil soal:", error);
        return {
            pertanyaan: "Maaf, koneksi ke server terputus. Berapakah 2 + 2?",
            pilihan: ["3", "4", "5", "6"],
            jawaban_benar: "4"
        };
    }
}

function tampilkanView(idView) {
    document.getElementById('view-landing').classList.add('hidden');
    document.getElementById('view-soal').classList.add('hidden');
    document.getElementById('view-hasil').classList.add('hidden');

    document.getElementById(idView).classList.remove('hidden');
}


async function mulaiGame() {
    if (isFetching) return;

    isFetching = true;

    tampilkanView('view-soal');
    jawabanTerpilih = null;
    document.getElementById('btn-konfirmasi').classList.add('hidden');

    document.getElementById('teks-soal').innerText = "Sedang memuat soal...";
    document.getElementById('pilihan-jawaban-container').innerHTML = '';

    dataSoalSaatIni = await fetchSoalDariAI();

    if (dataSoalSaatIni.error) {
        document.getElementById('teks-soal').innerText = dataSoalSaatIni.error;
        isFetching = false;
        return;
    }

    document.getElementById('teks-soal').innerText = dataSoalSaatIni.pertanyaan;

    const containerPilihan = document.getElementById('pilihan-jawaban-container');
    dataSoalSaatIni.pilihan.forEach(opsi => {
        const btn = document.createElement('button');
        btn.className = "opsi-jawaban w-full py-3 px-4 mb-3 bg-white border-2 border-green-200 hover:border-green-500 text-left text-lg font-medium rounded-lg transition-all";
        btn.innerText = opsi;
        btn.onclick = () => pilihJawaban(opsi, btn);
        containerPilihan.appendChild(btn);
    });

    isFetching = false;
}

function pilihJawaban(jawaban, elemenTombol) {
    jawabanTerpilih = jawaban;

    const semuaTombol = document.querySelectorAll('.opsi-jawaban');
    semuaTombol.forEach(t => {
        t.classList.remove('bg-green-100', 'border-green-500');
        t.classList.add('bg-white', 'border-green-200');
    });

    elemenTombol.classList.remove('bg-white', 'border-green-200');
    elemenTombol.classList.add('bg-green-100', 'border-green-500');

    document.getElementById('btn-konfirmasi').classList.remove('hidden');
}

function konfirmasiJawaban() {
    if (!jawabanTerpilih) return;

    const isBenar = (jawabanTerpilih === dataSoalSaatIni.jawaban_benar);

    document.getElementById('hasil-soal').innerText = dataSoalSaatIni.pertanyaan;
    document.getElementById('hasil-pilihan').innerText = jawabanTerpilih;

    const boxStatus = document.getElementById('box-status');
    const badgeStatus = document.getElementById('badge-status');
    const boxKunci = document.getElementById('box-kunci');

    if (isBenar) {
        boxStatus.className = "p-4 rounded-lg border-2 text-center border-green-500 bg-green-50 text-green-800";
        badgeStatus.className = "inline-block px-4 py-1 rounded-full text-white font-bold text-lg bg-green-500 mt-2";
        badgeStatus.innerText = "BENAR";
        boxKunci.classList.add('hidden');
    } else {
        boxStatus.className = "p-4 rounded-lg border-2 text-center border-red-500 bg-red-50 text-red-800";
        badgeStatus.className = "inline-block px-4 py-1 rounded-full text-white font-bold text-lg bg-red-500 mt-2";
        badgeStatus.innerText = "SALAH";

        boxKunci.classList.remove('hidden');
        document.getElementById('hasil-kunci').innerText = dataSoalSaatIni.jawaban_benar;
    }

    tampilkanView('view-hasil');
}


function selesaiGame() {
    dataSoalSaatIni = null;
    tampilkanView('view-landing');
}