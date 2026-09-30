import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
 
@Injectable()
export class DipsTabService {
  selectedInput: BehaviorSubject<number> = new BehaviorSubject<number>(1);
}