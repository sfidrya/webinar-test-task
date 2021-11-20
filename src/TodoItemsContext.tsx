import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";

export interface TodoItem {
  id: string;
  title: string;
  details?: string;
  done: boolean;
}

interface TodoItemsState {
  todoItems: TodoItem[];
}

interface LoadStateAction {
  type: "loadState";
  data: TodoItemsState;
}

export interface AddAction {
  type: "add";
  data: {
    todoItem: {
      title: string;
      details?: string;
    };
  };
}

interface DeleteAction {
  type: "delete";
  data: {
    id: string;
  };
}

interface ToggleDoneAction {
  type: "toggleDone";
  data: {
    id: string;
  };
}

interface SortByCompletionAction {
  type: "sortByCompletion";
}

interface SetAllItemsAction {
  type: "setAllItems";
  data: TodoItem[];
}

type TodoItemsAction =
  | LoadStateAction
  | AddAction
  | DeleteAction
  | ToggleDoneAction
  | SortByCompletionAction
  | SetAllItemsAction;

const TodoItemsContext = createContext<
  (TodoItemsState & { dispatch: (action: TodoItemsAction) => void }) | null
>(null);

const defaultState = { todoItems: [] };
const localStorageKey = "todoListState";

function loadStateFromLocalStorage(dispatch: Dispatch<TodoItemsAction>) {
  const savedState = localStorage.getItem(localStorageKey);
  if (savedState) {
    try {
      dispatch({ type: "loadState", data: JSON.parse(savedState) });
    } catch {}
  }
}

interface TodoItemsContextProviderProps {
  children?: ReactNode;
  onSaveError?: () => void;
}

export const TodoItemsContextProvider = ({
  children,
  onSaveError,
}: TodoItemsContextProviderProps) => {
  const [state, dispatch] = useReducer(todoItemsReducer, defaultState);

  useEffect(() => {
    loadStateFromLocalStorage(dispatch);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(state));
    } catch {
      console.error("Unable to save state");
      onSaveError?.();
      loadStateFromLocalStorage(dispatch);
    }
  }, [onSaveError, state]);

  return (
    <TodoItemsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </TodoItemsContext.Provider>
  );
};

export const useTodoItems = () => {
  const todoItemsContext = useContext(TodoItemsContext);

  if (!todoItemsContext) {
    throw new Error(
      "useTodoItems hook should only be used inside TodoItemsContextProvider"
    );
  }

  return todoItemsContext;
};

function todoItemsReducer(state: TodoItemsState, action: TodoItemsAction) {
  switch (action.type) {
    case "loadState": {
      return action.data;
    }
    case "add":
      return {
        ...state,
        todoItems: [
          { id: generateId(), done: false, ...action.data.todoItem },
          ...state.todoItems,
        ],
      };
    case "delete":
      return {
        ...state,
        todoItems: state.todoItems.filter(({ id }) => id !== action.data.id),
      };
    case "toggleDone":
      const itemIndex = state.todoItems.findIndex(
        ({ id }) => id === action.data.id
      );
      const item = state.todoItems[itemIndex];

      return {
        ...state,
        todoItems: [
          ...state.todoItems.slice(0, itemIndex),
          { ...item, done: !item.done },
          ...state.todoItems.slice(itemIndex + 1),
        ],
      };
    case "sortByCompletion": {
      const sortedItems = state.todoItems.slice().sort((a, b) => {
        if (a.done && !b.done) {
          return 1;
        }
        if (!a.done && b.done) {
          return -1;
        }
        return 0;
      });
      return {
        ...state,
        todoItems: sortedItems,
      };
    }
    case "setAllItems": {
      return {
        ...state,
        todoItems: action.data,
      };
    }
    default:
      throw new Error();
  }
}

function generateId() {
  return `${Date.now().toString(36)}-${Math.floor(
    Math.random() * 1e16
  ).toString(36)}`;
}
