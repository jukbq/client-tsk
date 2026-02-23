import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Firestore, doc, runTransaction } from '@angular/fire/firestore';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating.html',
  styleUrl: './rating.scss',
})
export class Rating {

  // 🔹 INPUTS (приходять зверху)
  ratingSumInput = input<number>(0);
  ratingCountInput = input<number>(0);
  recipeID = input.required<string>();

  // 🔹 ЛОКАЛЬНИЙ СТАН (ми його міняємо)
  localSum = signal(0);
  localCount = signal(0);

  private firestore = inject(Firestore);

  constructor() {
    // Синхронізація input → локальний стан
    effect(() => {
      this.localSum.set(this.ratingSumInput());
      this.localCount.set(this.ratingCountInput());
    });
  }

  average = computed(() => {
    const count = this.localCount();
    if (!count) return 0;
    return this.localSum() / count;
  });

  getVotesWord(count: number): string {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod100 >= 11 && mod100 <= 19) return 'голосів';
    if (mod10 === 1) return 'голос';
    if (mod10 >= 2 && mod10 <= 4) return 'голоси';
    return 'голосів';
  }

  async vote(value: number) {
    const id = this.recipeID();
    const storageKey = `recipe_vote_${id}`;

    if (!id) return;

    if (localStorage.getItem(storageKey)) {
      alert('Ти вже голосував(ла) 😉');
      return;
    }

    const recipeRef = doc(this.firestore, `short-recipes/${id}`);

    await runTransaction(this.firestore, async (transaction) => {
      const snap = await transaction.get(recipeRef);
      const data = snap.data();

      const newSum = (data?.['ratingSum'] || 0) + value;
      const newCount = (data?.['ratingCount'] || 0) + 1;

      transaction.update(recipeRef, {
        ratingSum: newSum,
        ratingCount: newCount
      });
    });

    // 🔥 Оновлюємо ЛОКАЛЬНО (а не input!)
    this.localSum.update(sum => sum + value);
    this.localCount.update(count => count + 1);

    localStorage.setItem(storageKey, value.toString());
  }
}