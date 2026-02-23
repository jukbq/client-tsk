import { Injectable } from '@angular/core';
import { doc, Firestore, runTransaction } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class Rating {

   constructor(private firestore: Firestore) {}

    async rateRecipe(uid: string, recipeId: string, value: number) {

    const recipeRef = doc(this.firestore, `short-recipes/${recipeId}`);
    const voteRef = doc(this.firestore, `recipeVotes/${recipeId}_${uid}`);

    await runTransaction(this.firestore, async (transaction) => {

      const recipeSnap = await transaction.get(recipeRef);
      const voteSnap = await transaction.get(voteRef);

      if (!recipeSnap.exists()) return;

      const data: any = recipeSnap.data();
      let ratingSum = data.ratingSum || 0;
      let ratingCount = data.ratingCount || 0;

      if (!voteSnap.exists()) {
        // перший голос
        ratingSum += value;
        ratingCount += 1;

        transaction.set(voteRef, {
          recipeId,
          uid,
          value,
          createdAt: new Date()
        });

      } else {
        // зміна голосу
        const oldValue = voteSnap.data()['value'];
        ratingSum = ratingSum - oldValue + value;

        transaction.update(voteRef, { value });
      }

      transaction.update(recipeRef, {
        ratingSum,
        ratingCount
      });

    });
  }
  
}
