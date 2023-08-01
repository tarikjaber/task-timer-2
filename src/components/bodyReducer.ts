import { Task } from "../utils/types";

// Define the type for the state
interface BodyState {
    isPlaying: boolean;
    currentTaskIndex: number;
    timeRemaining: number;
    tasks: Task[];
    tasksInputValue: string;
    inProgress: boolean;
    snackBarOpen: boolean;
    snackBarMessage: string;
    completedAllTasks: boolean;
}

// Define the type for the action
interface BodyAction {
    type: string;
    payload: any; // You should replace 'any' with the appropriate type for 'payload'
}

export const INITIAL_STATE: BodyState = {
    isPlaying: false,
    currentTaskIndex: 0,
    timeRemaining: 0,
    tasks: [],
    tasksInputValue: '',
    inProgress: false,
    snackBarOpen: false,
    snackBarMessage: '',
    completedAllTasks: false,
};

export const bodyReducer = (state: BodyState, action: BodyAction) => {
    switch (action.type) {
        case 'SET_IS_PLAYING':
            return {
                ...state,
                isPlaying: action.payload
            };
        case 'SET_CURRENT_TASK_INDEX':
            return {
                ...state,
                currentTaskIndex: action.payload
            };
        case 'SET_TIME_REMAINING':
            return {
                ...state,
                timeRemaining: action.payload
            };
        case 'SET_TASKS':
            return {
                ...state,
                tasks: action.payload
            };
        case 'SET_TASKS_INPUT_VALUE':
            return {
                ...state,
                tasksInputValue: action.payload
            };
        case 'SET_IN_PROGRESS':
            return {
                ...state,
                inProgress: action.payload
            };
        case 'SET_SNACK_BAR_OPEN':
            return {
                ...state,
                snackBarOpen: action.payload
            };
        case 'SET_SNACK_BAR_MESSAGE':
            return {
                ...state,
                snackBarMessage: action.payload
            };
        case 'SET_COMPLETED_ALL_TASKS':
            return {
                ...state,
                completedAllTasks: action.payload
            };
        default:
            return state;
    }
};
