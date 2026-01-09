import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CutInput {
  value: number | null;
  count: number;
}

interface BarResult {
  totalLength: number;
  cuts: number[];
  waste: number;
  stockReturn: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  currentYear = new Date().getFullYear();

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

  cutList: CutInput[] = [{ value: null, count: 1 }];
  optimizationResults: BarResult[] = [];
  isCalculating = false;
  errorMessage = '';

  constructor(private http: HttpClient) {}


  addKey() {
    this.cutList.push({ value: null, count: 1 });
    setTimeout(() => {
      const inputs = document.querySelectorAll('.cut-input-value');
      const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
      if (lastInput) lastInput.focus();
    }, 50);
  }

  removeKey(index: number) {
    this.cutList.splice(index, 1);
  }

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

  calculate() {
    this.isCalculating = true;
    this.errorMessage = '';
    this.optimizationResults = [];

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

  getNetUsage(): number {
    let totalUsage = 0;

    for (const bar of this.optimizationResults) {
      const physicalBarLength = bar.totalLength + bar.stockReturn;

      const fraction = bar.totalLength / physicalBarLength;

      totalUsage += fraction;
    }

    return totalUsage;
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
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;

      const imgHeight = canvas.height * imgWidth / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('plan_cięcia.pdf');
    });
  }
}
