import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { MeasurementService } from '../../services/measurement';
import { MEASUREMENT_LABELS } from '../../models/measurement';

interface HistoryRecord {
  id?: number;
  displayOp: string;
  displayType: string;
  displayInput: string;
  displayResult: string;
  displayTime: string;
  measurementType?: string;
  isError?: boolean;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class HistoryComponent implements OnInit {
  records: HistoryRecord[] = [];
  filtered: HistoryRecord[] = [];
  loading = false;
  errorMsg = '';

  selectedOperation = '';
  selectedType = '';
  searchText = '';

  operations = ['COMPARE', 'CONVERT', 'ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE'];
  types = Object.keys(MEASUREMENT_LABELS);
  typeLabels = MEASUREMENT_LABELS;
  userName = '';

  constructor(
    private authService: AuthService,
    private measurementService: MeasurementService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getCurrentUser()?.name?.split(' ')[0] || '';
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.errorMsg = '';
    this.records = [];

    const ops = ['COMPARE', 'CONVERT', 'ADD', 'SUBTRACT', 'MULTIPLY', 'DIVIDE'];
    let completed = 0;

    ops.forEach((op) => {
      this.measurementService.getHistoryByOperation(op).subscribe({
        next: (data: any[]) => {
          data.forEach((item) => {
            this.records.push(this.mapRecord(item, op));
          });
          completed++;
          if (completed === ops.length) {
            this.records.sort((a: any, b: any) => (b.id || 0) - (a.id || 0));
            this.applyFilters();
            this.loading = false;
          }
        },
        error: () => {
          completed++;
          if (completed === ops.length) {
            this.applyFilters();
            this.loading = false;
          }
        },
      });
    });
  }

  private normalize(val: number, unit: string): number {
    if (unit === 'FAHRENHEIT') return (val - 32) * 5 / 9;
    if (unit === 'KELVIN') return val - 273.15;
    if (unit === 'CELSIUS') return val;

    const factors: Record<string, number> = {
      FEET: 1, INCHES: 1 / 12, YARDS: 3, CENTIMETERS: 1 / 30.48,
      LITER: 1, MILLILITER: 0.001, GALLON: 3.785,
      KILOGRAM: 1000, GRAM: 1, MILLIGRAM: 0.001, POUND: 453.592, TONNE: 1000000 
    };
    return val * (factors[unit] || 1);
  }

  private fmt(n: any): string {
    if (n == null) return '';
    const num = Number(n);
    if (!isFinite(num)) return String(num);
    if (Math.abs(num) > 0 && (Math.abs(num) < 0.0001 || Math.abs(num) > 1e9))
      return num.toExponential(4);
    return parseFloat(num.toPrecision(7)).toString();
  }

  private mapRecord(item: any, op: string): HistoryRecord {
    console.log('Item:', item); 
    const type = item.thisMeasurementType || item.measurementType || item.thatMeasurementType || '';
    const typeLabel = MEASUREMENT_LABELS[type] || type || '—';
    const input =
      `${item.thisValue ?? ''} ${item.thisUnit ?? ''} / ${item.thatValue ?? ''} ${item.thatUnit ?? ''}`.trim();
    
    let result = '';
    if (item.isError) {
      result = '⚠ Error';
    } else if (op === 'COMPARE') {
      const eq = String(item.resultString) === 'true';
      const v1 = this.normalize(Number(item.thisValue || 0), item.thisUnit || '');
      const v2 = this.normalize(Number(item.thatValue || 0), item.thatUnit || '');
      const sym = eq ? '=' : (v1 > v2 ? '>' : '<');
      result = sym;
    } else {
      result = `${this.fmt(item.resultValue)} ${item.resultUnit || ''}`.trim();
      if (!result) result = '—';
    }

    const time = item.createdAt ? new Date(item.createdAt).toLocaleString() : '—';

    return {
      id: item.id,
      displayOp: op,
      displayType: typeLabel,
      displayInput: input || '—',
      displayResult: result,
      displayTime: time,
      measurementType: type,
      isError: item.isError,
    };
  }

  applyFilters(): void {
    this.filtered = this.records.filter((r) => {
      const matchOp = !this.selectedOperation || r.displayOp === this.selectedOperation;
      const matchType = !this.selectedType || r.measurementType === this.selectedType;
      const matchSearch =
        !this.searchText ||
        r.displayResult.toLowerCase().includes(this.searchText.toLowerCase()) ||
        r.displayInput.toLowerCase().includes(this.searchText.toLowerCase());
      return matchOp && matchType && matchSearch;
    });
  }

  clearFilters(): void {
    this.selectedOperation = '';
    this.selectedType = '';
    this.searchText = '';
    this.applyFilters();
  }

  // ── DELETE ALL ──────────────────────────────────────────────────
  deleteAll(): void {
    if (!confirm('Do you want to delete all history?')) return;
    this.measurementService.deleteAllHistory().subscribe({
      next: () => this.loadAll(),
      error: () => alert('Delete failed!'),
    });
  }



  goBack(): void {
    this.router.navigate(['/measurement']);
  }

  logout(): void {
    this.authService.logout();
  }
}
