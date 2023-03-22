import { createContext, useContext, useState, useEffect } from "react";
import stringToSlug from "@utils/stringToSlug";
import axios from "axios";

const BoardContext = createContext();

function BoardProvider({ children }) {
  const [boards, setBoards] = useState([]);
  const [currentBoard, setcurrentBoard] = useState(null);
  const [activeBoard, setActiveBoard] = useState(0);

  const statuses = currentBoard?.status;

  const getBoards = async () => {
    const bords = await axios
      .get("http://localhost:3000/boards")
      .then((res) => res.data.data);

    setBoards(bords);
    setcurrentBoard(currentBoard ? currentBoard : bords[0]);
    getStatus(currentBoard ? currentBoard : bords[0]);
  };

  const getStatus = async (board) => {
    setcurrentBoard(board);
    setActiveBoard(board.id);
    const status = await axios
      .get("http://localhost:3000/status?boardId=" + board.id)
      .then((res) => res.data);
    board.status = status;
    setcurrentBoard({...board});
  };

  const createTask = async (task) => {
    const column = currentBoard.status.find((column) => column.id === task.statusId);
    console.log(column);
    task.statusId = column.id;
    task.subtasks = task.subtasks.map((subtask) => {
      return {
        ...subtask,
        isCompleted: false,
      };
    });
 
    const res = await axios.post("http://localhost:3000/tasks", {
      title: task.title,
      statusId: task.statusId,
      subTask: { create: task.subtasks },
    });
    getStatus(currentBoard);
  };

  const createColumn = async (column) => {
    column.boardId = currentBoard.id;
    console.log(column);
    const res = await axios.post("http://localhost:3000/status", column);
    getStatus(currentBoard);
  };

  const createBoard = async (board) => {
    let newColumns = [];
    newColumns = board.columns.filter((e) => e);
    newColumns.length
      ? (newColumns = newColumns.map((column) => {
          return {
            name: column,
          };
        }))
      : null;

    const res = await axios.post("http://localhost:3000/boards", {
      name: board.name,
      status: { create: newColumns },
    });
    getBoards();
  };

  const updateTask = (updatedTask) => {
    const task = currentBoard.tasks.find((task) => task.id === updatedTask.id);

    if (updatedTask.status !== task.status) {
      const column = currentBoard.columns.find(
        (column) => column.name === updatedTask.status
      );
      const columnToRemove = currentBoard.columns.find(
        (column) => column.name === task.status
      );
      columnToRemove.tasks.splice(columnToRemove.tasks.indexOf(task.id), 1);
      column.tasks.push(task.id);
    }
    task.status = updatedTask.status;
    setBoards([...boards]);
  };

  const updateBoard = (updatedBoard) => {
    let newBoard = {
      ...currentBoard,
      name: updatedBoard.name,
      columns: updatedBoard.columns,
    };
    newBoard.columns.forEach((column, index) => {
      column.name = updatedBoard.columns[index].name;
      column.slug = stringToSlug(updatedBoard.columns[index].name);
    });

    const boardIndex = boards.findIndex((board) => board.id === newBoard.id);
    boards[boardIndex] = newBoard;
    setBoards([...boards]);
  };

  const toggleSubtask = async (subtask, subtaskId) => {
     const status = await axios.patch("http://localhost:3000/sub-tasks/" + subtask.id, {
      isCompleted: !subtask.isCompleted,
    });
    getStatus(currentBoard);
  };

  const changeTaskStatus = async (taskId, status) => {
   if (taskId) {
    const stat = await axios.patch("http://localhost:3000/tasks/" + taskId, {
      statusId: status.id,
    });
    getStatus(currentBoard);
   } else {
    const column = statuses.find((column) => column.id === status.id);
   }
   
   
  };

  const deleteTask = async (taskId) => {
    const stat = await axios.delete("http://localhost:3000/tasks/" + taskId)

    getStatus(currentBoard);
  };

  const deleteBoard = async (boardId) => {
    setActiveBoard(0);
    const res = await axios.delete("http://localhost:3000/boards/" + boardId);
    setBoards(boards.filter((board) => board.id !== boardId));
  };

  const dragTask = async (source, destination) => {
    // dropped outside a column
    if (!destination) {
      return;
    }

    // if the source and destination are the same, do nothing
    if (
      source.droppableId === destination.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    // If the card is moved within the same column and just needs an index change
    if (source.droppableId === destination.droppableId) {
      const column = statuses.find(
        (column) => column.id === source.droppableId
      );
      const taskId = column.task[source.index];
      column.task.splice(source.index, 1);
      column.task.splice(destination.index, 0, taskId);
      setBoards([...boards]);
    }
    //If the card has been moved to a different column
    else {
      const column = statuses.find(
        (column) => column.id === +source.droppableId
      );
      console.log(source);
      console.log(destination);
      console.log(column);
      const task = column.task[source.index];
      const status = await axios.patch(
        "http://localhost:3000/tasks/" + task.id,
        { statusId: +destination.droppableId }
      );
      getStatus(currentBoard);
    }
  };

  const value = {
    boards,
    setBoards,
    activeBoard,
    currentBoard,
    statuses,
    createBoard,
    createColumn,
    toggleSubtask,
    createTask,
    changeTaskStatus,
    updateTask,
    updateBoard,
    deleteTask,
    deleteBoard,
    dragTask,
    setcurrentBoard,
    getBoards,
    getStatus,
  };
  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
}

const useBoards = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error("useBoards must be used within a BoardProvider");
  }
  return context;
};

export { BoardProvider, useBoards };
