// 1. Inisialisasi Data
let database = JSON.parse(localStorage.getItem('absen_db_vFinal')) || [];
let selectedGroup = '';
let currentFilter = 'ALL';

// 2. Fungsi Update Statistik (Ini yang membuat angka di header berubah)
function updateStats() {
    // Total Seluruhnya
    const total = database.length;
    document.getElementById('statTotal').innerText = total;

    // Hitung per Kelompok
    const totalA = database.filter(item => item.kelompok === 'A').length;
    const totalB = database.filter(item => item.kelompok === 'B').length;
    
    // Kelompok C dan D digabung sesuai desain sebelumnya
    const totalCD = database.filter(item => item.kelompok === 'C' || item.kelompok === 'D').length;

    // Masukkan ke elemen HTML
    document.getElementById('statA').innerText = totalA;
    document.getElementById('statB').innerText = totalB;
    document.getElementById('statCD').innerText = totalCD;
}

// 3. Fungsi Pilih Kelompok
function selectGroup(g) {
    selectedGroup = g;
    document.querySelectorAll('.group-opt').forEach(btn => {
        btn.classList.remove('border-indigo-500', 'text-indigo-600', 'bg-indigo-50');
        btn.classList.add('border-slate-100', 'text-slate-400');
    });
    const active = document.getElementById('btn' + g);
    active.classList.add('border-indigo-500', 'text-indigo-600', 'bg-indigo-50');
}

// 4. Fungsi Proses Absen
function prosesAbsen() {
    const namaInput = document.getElementById('nama');
    if (!namaInput.value.trim() || !selectedGroup) {
        alert("Mohon isi nama dan pilih kelompok!");
        return;
    }

    const dataBaru = {
        id: Date.now(),
        nama: namaInput.value.trim(),
        kelompok: selectedGroup,
        jam: new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}),
        tanggal: new Date().toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})
    };

    database.unshift(dataBaru);
    localStorage.setItem('absen_db_vFinal', JSON.stringify(database));
    
    namaInput.value = '';
    renderData(); // Memanggil renderData yang di dalamnya ada updateStats
}

// 5. Fungsi Render Data ke Layar
function renderData() {
    const display = document.getElementById('historyDisplay');
    let filtered = currentFilter === 'ALL' ? database : database.filter(i => i.kelompok === currentFilter);

    if (filtered.length === 0) {
        display.innerHTML = `<div class="text-center py-10 opacity-20"><p>Tidak ada data</p></div>`;
    } else {
        display.innerHTML = filtered.map(item => `
            <div class="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm mb-3 fade-in">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">${item.kelompok}</div>
                    <div>
                        <h4 class="font-bold text-slate-800 text-sm uppercase">${item.nama}</h4>
                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${item.tanggal} - ${item.jam}</p>
                    </div>
                </div>
                
                <button onclick="hapusItem(${item.id})" class="btn-delete-item" title="Hapus baris ini">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    updateStats();
}

// 6. Fungsi Filter
function filterBy(g) {
    currentFilter = g;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('tab-active');
        btn.classList.add('text-slate-500');
    });
    document.getElementById('tab' + g).classList.add('tab-active');
    renderData();
}

// 7. Fungsi Cetak & Excel (Tetap seperti sebelumnya)
function siapkanDanCetak() {
    const tableBody = document.getElementById('tableBodyContent');
    let filtered = currentFilter === 'ALL' ? database : database.filter(i => i.kelompok === currentFilter);
    document.getElementById('printSubtitle').innerText = "DATA PESERTA: " + (currentFilter === 'ALL' ? "SEMUA KELOMPOK" : "KELOMPOK " + currentFilter);
    document.getElementById('printTimestamp').innerText = new Date().toLocaleString('id-ID');
    tableBody.innerHTML = filtered.map((item, index) => `
        <tr><td>${index + 1}</td><td>${item.nama.toUpperCase()}</td><td>${item.kelompok}</td><td>${item.tanggal}</td><td>${item.jam}</td></tr>
    `).join('');
    window.print();
}

function eksporExcel() {
    let filtered = currentFilter === 'ALL' ? database : database.filter(i => i.kelompok === currentFilter);
    if (filtered.length === 0) return alert("Data kosong!");
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absensi");
    XLSX.writeFile(wb, `Laporan_Absen.xlsx`);
}

function hapusSemua() {
    if(confirm("Hapus semua data?")) {
        database = [];
        localStorage.removeItem('absen_db_vFinal');
        renderData();
    }
}

// Jalankan saat startup
document.addEventListener('DOMContentLoaded', renderData);

// FUNGSI BARU: Hapus item berdasarkan ID
function hapusItem(id) {
    if (confirm("Hapus data absen ini?")) {
        // Filter database untuk membuang item dengan ID yang dipilih
        database = database.filter(item => item.id !== id);
        
        // Simpan kembali ke LocalStorage
        localStorage.setItem('absen_db_vFinal', JSON.stringify(database));
        
        // Render ulang tampilan dan statistik
        renderData();
    }
}

// ... (sisanya tetap sama) ...