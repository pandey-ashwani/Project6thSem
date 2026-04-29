// Doctor Prescription JS - Modern Features
document.addEventListener('DOMContentLoaded', function() {
  const datalist = document.getElementById('medicine-list');
  const commonMedicines = [
    'Paracetamol 500mg Tablet', 'Ibuprofen 400mg Tablet', 'Amoxicillin 500mg Capsule',
    'Amlodipine 5mg Tablet', 'Metformin 500mg Tablet', 'Atenolol 50mg Tablet',
    'Losartan 50mg Tablet', 'Atorvastatin 20mg Tablet', 'Omeprazole 20mg Capsule',
    'Cetirizine 10mg Tablet', 'Azithromycin 500mg Tablet'
  ];
  
  commonMedicines.forEach(medicine => {
    const option = document.createElement('option');
    option.value = medicine;
    datalist.appendChild(option);
  });

  // Search filter
  const medicineSearch = document.getElementById('medicineSearch');
  if (medicineSearch) {
    medicineSearch.addEventListener('input', function(e) {
      const term = e.target.value.toLowerCase();
      Array.from(datalist.options).forEach(option => {
        option.hidden = !option.value.toLowerCase().includes(term);
      });
    });
  }

  // Form validation
  const form = document.getElementById('prescriptionForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      let isValid = true;
      const rows = document.querySelectorAll('#prescription-table-body tr');
      
      rows.forEach(row => {
        const medicine = row.cells[0]?.querySelector('input')?.value.trim();
        const dosage = row.cells[1]?.querySelector('input')?.value.trim();
        const duration = row.cells[2]?.querySelector('input')?.value.trim();
        
        if (!medicine || !dosage || !duration) {
          isValid = false;
          row.style.backgroundColor = '#fee2e2';
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => row.style.backgroundColor = '', 3000);
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        alert('Please fill all required fields in medicine rows.');
      }
    });
  }
});

function addRow() {
  const tbody = document.getElementById('prescription-table-body');
  const row = tbody.insertRow();
  row.innerHTML = `
    <td>
      <input name="medicine[]" type="text" class="form-control medicine-input" list="medicine-list" placeholder="Medicine Name" required />
    </td>
    <td>
      <input name="dosage[]" type="text" class="form-control" placeholder="1-0-1" pattern="[0-9]+-[0-9]+-[0-9]+" title="Format: 1-0-1" required />
    </td>
    <td>
      <input name="duration[]" type="text" class="form-control" placeholder="5 days" required />
    </td>
    <td>
      <input name="instructions[]" type="text" class="form-control" placeholder="After meals" />
    </td>
    <td>
      <button type="button" class="btn btn-remove" onclick="removeRow(this)">
        <i class="fa-solid fa-trash"></i> Remove
      </button>
    </td>
  `;
}

function removeRow(button) {
  const tbody = document.getElementById('prescription-table-body');
  const row = button.closest('tr');
  if (tbody.rows.length > 1) {
    row.remove();
  } else {
    alert('At least one medicine row required.');
  }
}

function previewPrescription() {
  const medicines = Array.from(document.querySelectorAll('input[name="medicine[]"]')).map((input, i) => ({
    medicine: input.value || 'N/A',
    dosage: document.querySelectorAll('input[name="dosage[]"]')[i]?.value || 'N/A',
    duration: document.querySelectorAll('input[name="duration[]"]')[i]?.value || 'N/A',
    instructions: document.querySelectorAll('input[name="instructions[]"]')[i]?.value || ''
  })).filter(m => m.medicine !== 'N/A');
  
  if (medicines.length === 0) {
    alert('Please add medicines first!');
    return;
  }
  
  console.log('Prescription Preview:', medicines);
  alert('✅ Preview OK! Check console. Ready to save/print.');
}

function downloadPDF() {
  window.print();
  alert('📄 Use Print → Save as PDF');
}

