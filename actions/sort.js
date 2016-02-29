//ソートする

export const ACTION_SORT = 'ACTION_SORT';

export function sort(mode){
    return {
        type: ACTION_SORT,
        mode
    };
}
