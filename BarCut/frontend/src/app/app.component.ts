import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CutInput {
  value: number | null;
  count: number; // Nowe pole: Ilość sztuk
}

interface BarResult {
  totalLength: number;
  cuts: number[];
  waste: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  currentYear = new Date().getFullYear();

  // Konfiguracja
  selectedStockLength: number = 6000;
  selectedUnit: string = 'mm';

  stockOptions = [
    { label: 'Pręt 6m (6000mm)', value: 6000 },
    { label: 'Pręt 12m (12000mm)', value: 12000 }
  ];

  unitOptions = [
    { label: 'Milimetry (mm)', value: 'mm' },
    { label: 'Centymetry (cm)', value: 'cm' },
    { label: 'Metry (m)', value: 'm' }
  ];

  // Domyślnie 1 sztuka
  cutList: CutInput[] = [{ value: null, count: 1 }];
  optimizationResults: BarResult[] = [];
  isCalculating = false;
  errorMessage = '';

  constructor(private http: HttpClient) {}

  // --- AKCJE ---

  addKey() {
    this.cutList.push({ value: null, count: 1 });
    // Focus na nowym polu (długości)
    setTimeout(() => {
      const inputs = document.querySelectorAll('.cut-input-value');
      const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
      if (lastInput) lastInput.focus();
    }, 50);
  }

  removeKey(index: number) {
    this.cutList.splice(index, 1);
  }

  // NOWE: Resetowanie formularza
  resetData() {
    if (confirm('Czy na pewno chcesz wyczyścić wszystkie dane?')) {
      this.cutList = [{ value: null, count: 1 }];
      this.optimizationResults = [];
      this.errorMessage = '';
    }
  }

  selectAllContent(event: any) {
    event.target.select();
  }

  // --- OBLICZENIA ---

  calculate() {
    this.isCalculating = true;
    this.errorMessage = '';
    this.optimizationResults = []; // Czyścimy poprzednie wyniki

    const multiplier = this.getMultiplierToMm();
    const cutsInMm: number[] = [];

    this.cutList.forEach(item => {
      if (item.value && item.value > 0 && item.count > 0) {
        const valInMm = item.value * multiplier;
        for (let i = 0; i < item.count; i++) {
          cutsInMm.push(valInMm);
        }
      }
    });

    if (cutsInMm.length === 0) {
      this.isCalculating = false;
      return;
    }

    const payload = {
      cuts: cutsInMm,
      stockLength: this.selectedStockLength
    };

    this.http.post<BarResult[]>('/api/optimize', payload)
      .subscribe({
        next: (data) => {
          this.optimizationResults = data;
          this.isCalculating = false;
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Błąd! Sprawdź dane wejściowe.';
          this.isCalculating = false;
        }
      });
  }

  getMultiplierToMm(): number {
    if (this.selectedUnit === 'cm') return 10;
    if (this.selectedUnit === 'm') return 1000;
    return 1;
  }

  formatLength(valInMm: number): string {
    let val = valInMm;
    if (this.selectedUnit === 'cm') val = valInMm / 10;
    if (this.selectedUnit === 'm') val = valInMm / 1000;
    return parseFloat(val.toFixed(2)) + ' ' + this.selectedUnit;
  }

  getPercentage(valInMm: number, totalInMm: number): number {
    return (valInMm / totalInMm) * 100;
  }

  generatePDF() {
    const data = document.getElementById('visualization-container');
    if (!data) return;

    html2canvas(data, { scale: 2 }).then(canvas => {
      const imgWidth = 190;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      const pdf = new jsPDF('p', 'mm', 'a4');

      pdf.text('Raport Ciecia', 10, 10);
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 20, imgWidth, imgHeight);
      pdf.save('raport_ciecia.pdf');
    });
  }
}
