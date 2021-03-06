import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/Delete";
import classnames from "classnames";
import { motion } from "framer-motion";
import { forwardRef, useCallback, useState } from "react";
import {
  DragDropContext,
  Draggable,
  DragStart,
  Droppable,
  DropResult,
  ResponderProvided,
} from "react-beautiful-dnd";
import { TodoItem, useTodoItems } from "./TodoItemsContext";

const spring = {
  type: "spring",
  damping: 25,
  stiffness: 120,
  duration: 0.25,
};

const useTodoItemListStyles = makeStyles({
  root: {
    listStyle: "none",
    padding: 0,
  },
});

export const TodoItemsList = function () {
  const { todoItems, dispatch } = useTodoItems();
  const [isDragging, setIsDragging] = useState(false);

  const classes = useTodoItemListStyles();

  function reorder(items: TodoItem[], startIndex: number, endIndex: number) {
    const result = Array.from(items);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  }

  const handleBeforeDragStart = useCallback((initial: DragStart) => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    (result: DropResult, provided: ResponderProvided) => {
      setIsDragging(false);
      if (!result.destination) {
        return;
      }
      const items = reorder(
        todoItems,
        result.source.index,
        result.destination.index
      );

      dispatch({ type: "setAllItems", data: items });
    },
    [todoItems, dispatch]
  );

  const motionAttributes = isDragging
    ? {}
    : {
        transition: spring,
        layout: true,
      };

  return (
    <DragDropContext
      onBeforeDragStart={handleBeforeDragStart}
      onDragEnd={handleDragEnd}
    >
      <Droppable
        droppableId="droppable"
        renderClone={(provided, snapshot, rubric) => (
          <TodoItemCard
            item={todoItems[rubric.source.index]}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          />
        )}
      >
        {(provided, snapshot) => (
          <ul
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={classes.root}
          >
            {todoItems.map((item, index) => (
              <motion.li key={item.id} {...motionAttributes}>
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <TodoItemCard
                      item={item}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    />
                  )}
                </Draggable>
              </motion.li>
            ))}{" "}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};

const useTodoItemCardStyles = makeStyles({
  root: {
    marginTop: 24,
  },
  doneRoot: {
    textDecoration: "line-through",
    color: "#888888",
  },
});

export const TodoItemCard = forwardRef(
  ({ item, ...props }: { item: TodoItem }, ref) => {
    const classes = useTodoItemCardStyles();
    const { dispatch } = useTodoItems();

    const handleDelete = useCallback(
      () => dispatch({ type: "delete", data: { id: item.id } }),
      [item.id, dispatch]
    );

    const handleToggleDone = useCallback(() => {
      dispatch({
        type: "toggleDone",
        data: { id: item.id },
      });
      dispatch({ type: "sortByCompletion" });
    }, [item.id, dispatch]);

    return (
      <Card
        {...props}
        ref={ref}
        className={classnames(classes.root, {
          [classes.doneRoot]: item.done,
        })}
      >
        <CardHeader
          action={
            <IconButton aria-label="delete" onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          }
          title={
            <FormControlLabel
              control={
                <Checkbox
                  checked={item.done}
                  onChange={handleToggleDone}
                  name={`checked-${item.id}`}
                  color="primary"
                />
              }
              label={item.title}
            />
          }
        />
        {item.details ? (
          <CardContent>
            <Typography variant="body2" component="p">
              {item.details}
            </Typography>
          </CardContent>
        ) : null}
      </Card>
    );
  }
);
