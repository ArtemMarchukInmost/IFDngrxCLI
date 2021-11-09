import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {Actions, createEffect, ofType} from '@ngrx/effects';

@Injectable()
export class #NameEffects {

    constructor(private actions$: Actions,
                private store$: Store) {
    }

}
