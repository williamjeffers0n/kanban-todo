import axios from "axios";

export const getBoards = async () => {
  return axios.get("http://localhost:3000/boards").then((res) => res.data);
};

export const createTask = (task) => {
  task.id = uuidv4();
  const column = columns.find((column) => column.name === task.status);
  task.status = column.name;
  task.subtasks = task.subtasks.map((subtask) => {
    return {
      ...subtask,
      isCompleted: false,
    };
  });
  task.slug = stringToSlug(task.title);
  console.log(task);
  column.tasks.push(task.id);
  currentBoard.tasks.push(task);
  setBoards([...boards]);
};

export const createColumn = (column) => {
  column.id = uuidv4();
  column.tasks = [];
  currentBoard.columns.push(column);
  setBoards([...boards]);
};

export const createBoard = (board) => {
  const { isLoading, isError, data, error, refetch } = useQuery(
    ["boards"],
    getBoards
  );
  let boards = [];
  if (data) {
    boards = data.data;
    currentBoard = boards[0];
    console.log(data.data);
  }
  board.id = uuidv4();
  let newColumns = [];
  newColumns = board.columns.filter((e) => e);
  newColumns.length
    ? (newColumns = newColumns.map((column) => {
        return {
          id: uuidv4(),
          name: column,
          tasks: [],
          slug: stringToSlug(column),
        };
      }))
    : null;
  console.log(newColumns);
  board.columns = newColumns;
  board.tasks = [];
  setBoards([...boards, board]);
};

export const updateTask = (updatedTask) => {
  const task = currentBoard.tasks.find((task) => task.id === updatedTask.id);
  task.title = updatedTask.title;
  task.subtasks = updatedTask.subtasks;
  task.slug = stringToSlug(task.title);
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

export const updateBoard = (updatedBoard) => {
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

export const toggleSubtask = (taskId, subtaskId) => {
  const task = currentBoard.tasks.find((task) => task.id === taskId);
  const subtask = task.subtasks[subtaskId];
  subtask.isCompleted
    ? (subtask.isCompleted = false)
    : (subtask.isCompleted = true);
  setBoards([...boards]);
};

export const changeTaskStatus = (taskId, status) => {
  const task = currentBoard.tasks.find((task) => task.id === taskId);
  const column = columns.find((column) => column.name === status);
  const prevColumn = columns.find((column) => column.name === task.status);
  prevColumn.tasks = prevColumn.tasks.filter((id) => id !== taskId);
  column.tasks.push(taskId);
  task.status = column.name;
  setBoards([...boards]);
};

export const deleteTask = (taskId) => {
  const task = currentBoard.tasks.find((task) => task.id === taskId);
  const column = columns.find((column) => column.name === task.status);
  column.tasks = column.tasks.filter((id) => id !== taskId);
  console.log(currentBoard.tasks);
  currentBoard.tasks = currentBoard.tasks.filter((task) => task.id !== taskId);
  setBoards([...boards]);
  console.log(boards);
};

export const deleteBoard = (boardId) => {
  setActiveBoard(0);
  setBoards(boards.filter((board) => board.id !== boardId));
};

export const dragTask = (source, destination) => {
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
    const column = columns.find((column) => column.name === source.droppableId);
    const taskId = column.tasks[source.index];
    column.tasks.splice(source.index, 1);
    column.tasks.splice(destination.index, 0, taskId);
    setBoards([...boards]);
  }
  //If the card has been moved to a different column
  else {
    const column = columns.find((column) => column.name === source.droppableId);
    const taskId = column.tasks[source.index];
    const draggedTask = currentBoard.tasks.find((task) => task.id === taskId);
    draggedTask.status = destination.droppableId;
    column.tasks.splice(source.index, 1);
    const newColumn = columns.find(
      (column) => column.name === destination.droppableId
    );
    newColumn.tasks.splice(destination.index, 0, taskId);
    setBoards([...boards]);
  }
};
