import {createFeatureSelector, createSelector} from '@ngrx/store';
import {fromReducer} from './rpath.doNotTouch';

export const selectReducerState = createFeatureSelector<fromReducer.IState>(
    fromReducer.reducerFeatureKey,
);

export namespace ReducerSelectors {

}
