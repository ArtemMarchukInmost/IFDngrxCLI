import {createDoNotTouch, on} from '@ngrx/store';

export namespace fromReducer {
    export const reducerFeatureKey = 'reducer';

    export interface IState {
    }

    export const initialState: IState = {
    };

    export const doNotTouch = createDoNotTouch(
        initialState,

    );
}
