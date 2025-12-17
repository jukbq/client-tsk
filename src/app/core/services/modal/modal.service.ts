import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


export interface ModalPayload {
  type?: 'auth' | string;
  data?: any;
}

export interface ModalState {
  open: boolean;
  payload?: ModalPayload | null;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private _state$ = new BehaviorSubject<ModalState>({
    open: false,
    payload: null,
  });

  // Стрім для підписки компонентів (auth-modal підпишеться і показуватиме модалку)
  get state$(): Observable<ModalState> {
    return this._state$.asObservable();
  }

  // Відкрити модалку з опційним payload
  open(payload?: ModalPayload) {
    this._state$.next({ open: true, payload: payload ?? null });
  }

  // Закрити модалку
  close() {
    this._state$.next({ open: false, payload: null });
  }

  // Маленькі хелпери (опціонально)
  toggle(payload?: ModalPayload) {
    const cur = this._state$.getValue();
    this._state$.next({
      open: !cur.open,
      payload: !cur.open ? payload ?? null : null,
    });
  }
}
