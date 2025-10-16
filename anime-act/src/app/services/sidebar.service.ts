import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private _visible$ = new BehaviorSubject<boolean>(false);

  get visible$(): Observable<boolean> {
    return this._visible$.asObservable();
  }

  isVisible(): boolean {
    return this._visible$.getValue();
  }

  open() {
    this._visible$.next(true);
  }

  close() {
    this._visible$.next(false);
  }

  toggle() {
    this._visible$.next(!this._visible$.getValue());
  }
}
