import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as PizZip from 'pizzip';
import * as Docxtemplater from 'docxtemplater';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-reactive-table-docxtemplater',
  templateUrl: './reactive-table-docxtemplater.component.html',
  styleUrls: ['./reactive-table-docxtemplater.component.css']
})
export class ReactiveTableDocxtemplaterComponent {

  secret_api: string = '';
  apiInput: string = '';
  place: string = 'Yogyakarta';

  tenagaRows = [
    { name: '', nip: '', jabatan: '', edit: false }
  ];
  dosenRows = [
    { name: '', nip: '', jabatan: '', edit: false }
  ];

  selectedRowIndex: number | null = null; // This will be a global index

  exportForm: FormGroup;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.exportForm = this.fb.group({
      apiInput: ['']
    });
  }

  // Helper to get the global index for selection
  getGlobalIndex(type: 'tenaga' | 'dosen', i: number): number {
    return type === 'tenaga' ? i : this.tenagaRows.length + i;
  }

  // Helper to get the selected row object
  getSelectedRow() {
    if (this.selectedRowIndex === null) return null;
    if (this.selectedRowIndex < this.tenagaRows.length) {
      return this.tenagaRows[this.selectedRowIndex];
    } else {
      return this.dosenRows[this.selectedRowIndex - this.tenagaRows.length];
    }
  }

  addRow(type: 'tenaga' | 'dosen') {
    const newRow = { name: '', nip: '', jabatan: '', edit: false }; // Not in edit mode
    if (type === 'tenaga') {
      this.tenagaRows.push(newRow);
    } else {
      this.dosenRows.push(newRow);
    }
  }

  selectRow(globalIndex: number) {
    this.selectedRowIndex = globalIndex;
  }

  editRow(row: any) {
    row.edit = true;
  }

  cancelEdit(row: any, index: number) {
    // Optionally reset the row to its previous value if you store a backup
    row.edit = false;
  }

  saveRow(row: any) {
    row.edit = false;
  }

  deleteRow(globalIndex: number) {
    if (globalIndex < this.tenagaRows.length) {
      this.tenagaRows.splice(globalIndex, 1);
    } else {
      this.dosenRows.splice(globalIndex - this.tenagaRows.length, 1);
    }
    this.selectedRowIndex = null;
  }

  // Add this method to generate formdata from rows
  private generateFormData() {
    return {
      groups: [
        {
          groupName: 'Tenaga Pendidik',
          isFirst: true,
          header1: 'Nama',
          header2: 'NIP',
          header3: 'Jabatan',
          users: this.tenagaRows.map(row => ({
            name: row.name,
            nip: row.nip,
            jabatan: row.jabatan
          }))
        },
        {
          groupName: 'Dosen',
          isFirst: false,
          header1: 'Nama',
          header2: 'NIP',
          header3: 'Jabatan',
          users: this.dosenRows.map(row => ({
            name: row.name,
            nip: row.nip,
            jabatan: row.jabatan
          }))
        }
      ]
    };
  }

  exportPdf() {
    const apiInput = this.exportForm.get('apiInput')?.value;
    if (!apiInput || !apiInput.trim()) {
      return;
    }

    const templatePath = 'assets/table.docx';
    const formdata = this.generateFormData(); // Use dynamic data

    this.http.get(templatePath, { responseType: 'arraybuffer' }).subscribe((content: ArrayBuffer) => {
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
      doc.setData(formdata);

      try {
        doc.render();
      } catch (error) {
        console.error('Docxtemplater error:', error);
        return;
      }

      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      // Prepare FormData for ConvertAPI
      const formData = new FormData();
      formData.append('File', out, 'output.docx');

      // Use the API input from the form
      const apiUrl = `https://v2.convertapi.com/convert/doc/to/pdf?Auth=${apiInput}`;

      this.http.post(apiUrl, formData).subscribe(
        (response: any) => {
          if (response && response.Files && response.Files.length > 0) {
            alert('PDF berhasil diekspor!'); // Success alert
            this.exportForm.get('apiInput')?.setValue(''); // Clear the API input after success
            const fileData = response.Files[0].FileData; // base64 string
            const byteCharacters = atob(fileData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const pdfUrl = window.URL.createObjectURL(blob);
            window.open(pdfUrl, '_blank');
            setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 10000);
          } else {
            console.error('PDF conversion failed:', response);
          }
        },
        error => {
          if (error.status === 401) {
            alert('API key salah atau tidak valid. Silakan cek kembali API key Anda.');
            this.exportForm.get('apiInput')?.setValue(''); // Clear the API input after alert
          } else {
            console.error('PDF conversion error:', error);
          }
        }
      );
    });
  }

  exportDocx() {
    const templatePath = 'assets/table.docx';
    const formdata = this.generateFormData(); // Use dynamic data

    this.http.get(templatePath, { responseType: 'arraybuffer' }).subscribe((content: ArrayBuffer) => {
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
      doc.setData(formdata);

      try {
        doc.render();
      } catch (error) {
        console.error('Docxtemplater error:', error);
        return;
      }

      const out = doc.getZip().generate({
        type: 'blob',
        mimeType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      // Download the generated docx
      const url = window.URL.createObjectURL(out);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'output.docx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // Fungsi untuk tanggal Indonesia
  getIndonesianDate(): string {
    const bulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const now = new Date();
    const hari = now.getDate().toString().padStart(2, '0');
    const bulanStr = bulan[now.getMonth()];
    const tahun = now.getFullYear();
    return `${this.place}, ${hari} ${bulanStr} ${tahun}`;
  }

}
