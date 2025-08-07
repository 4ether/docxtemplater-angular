import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as PizZip from 'pizzip';
import * as Docxtemplater from 'docxtemplater';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Component({
  selector: 'app-reactive-table-docxtemplater',
  templateUrl: './reactive-table-docxtemplater.component.html',
  styleUrls: ['./reactive-table-docxtemplater.component.css']
})
export class ReactiveTableDocxtemplaterComponent {

  // Dummy users data
  formdata = {
    tableTitle: 'Daftar Pengguna Berdasarkan Grup',
    groups: [
    {
      groupName: 'Tenaga Pendidik',
      isFirst: true,
      header1 : 'Nama',
      header2 : 'NIP',
      header3 : 'Jabatan',
      users: [
      { name: 'John', nip: '123456789', jabatan: 'Lektor Kepala' },
      { name: 'Jane', nip: '987654321', jabatan: 'Lektor' }
      ]
    },
    {
      groupName: 'Dosen',
      isFirst: false,
      users: [
      { name: 'Alice', nip: '111222333', jabatan: 'Dosen' },
      { name: 'Bob', nip: '444555666', jabatan: 'Dosen' },
      { name: 'Carol', nip: '777888999', jabatan: 'Dosen' }
      ]
    }
    ]
  };

  constructor(
    private http: HttpClient
  ) { }

  exportPdf() {
    const templatePath = 'assets/table.docx';

    this.http.get(templatePath, { responseType: 'arraybuffer' }).subscribe((content: ArrayBuffer) => {
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
      doc.setData(this.formdata);

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

      // Replace 'YOUR_SECRET' with your actual ConvertAPI secret
      const apiUrl = 'https://v2.convertapi.com/convert/doc/to/pdf?Auth={{YOUR_SECRET}}';

      this.http.post(apiUrl, formData).subscribe((response: any) => {
        if (response && response.Files && response.Files.length > 0) {
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
      }, error => {
        console.error('PDF conversion error:', error);
      });
    });
  }

  exportDocx() {
    // Path to your template (adjust if needed)
    const templatePath = 'assets/table.docx';

    this.http.get(templatePath, { responseType: 'arraybuffer' }).subscribe((content: ArrayBuffer) => {
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
      doc.setData(this.formdata);

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

}
