import { DragDropContext } from 'react-beautiful-dnd';
import { useBoards } from "@src/context";
import Column from "./Column";
import Task from "./Task";
import EmptyBoard from "./EmptyBoard";
import NewColumn from './NewColumn';
import NoBoardsFound from './NoBoardsFound';
import { useEffect } from "react";

const Board = () => {
  const {currentBoard, boards, dragTask} = useBoards();

  function handleOnDragEnd(result) {
    const {source, destination} = result;
    dragTask(source, destination);
  }
  if(!boards.length) return <NoBoardsFound />
  if(!currentBoard.status?.length) return <EmptyBoard />

  return (
    <main className='overflow-y-hidden scrollbar-thin scrollbar-thumb-mainPurple scrollbar-track-transparent flex-1 p-4 space-x-4 bg-lightGrey dark:bg-veryDarkGrey flex'>
        <DragDropContext
            onDragEnd={handleOnDragEnd}
        >
        {
            currentBoard.status?.map((column, i) => (
                <Column data={column} key={i}>
                    {
                        column?.task?.map((newtask, j) => {
                            // const task = currentBoard.tasks.filter(task => task.id === taskId)[0];
                            return <Task data={newtask} index={j} key={newtask.id} />
                        })
                    }
                </Column>
            ))
        }
        </DragDropContext>
        <NewColumn />
    </main>
  )
}
export default Board
