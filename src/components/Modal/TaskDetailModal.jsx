import { useBoards } from "@src/context";
import EditButton from "@components/shared/EditButton";
import StatusDropdown from "@components/shared/StatusDropdown";
import { useEffect, useState } from "react";
const TaskDetailModal = ({
  data,
  completedSubtasks,
  switchToUpdate,
  switchToDelete,
}) => {
  const { toggleSubtask, statuses } = useBoards();
  const [status, setStatus] = useState('');

  useEffect(() => {
    const status = statuses.find((status) => status.id === data.statusId);
    console.log(status);
    setStatus(status.name);
  }, []);

  return (
    <div className="w-full mx-auto rounded-md p-6 bg-white dark:bg-darkGrey md:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="heading-lg">{data.title}</h1>
        <EditButton
          switchToDelete={switchToDelete}
          taskId={data.id}
          type="Task"
          className="bottom-0 left-0 -translate-x-2/4 translate-y-28"
        />
      </div>
      <p className="body-lg text-mediumGrey">{data.description}</p>
      <h3 className="mt-6 mb-4 body-md text-mediumGrey dark:text-white">
        Subtasks ({completedSubtasks} of {data.subTask.length})
      </h3>
      {data.subTask.map((subtask, i) => (
        <label
          key={i}
          htmlFor={`${subtask}-${i}`}
          className={`body-md p-3 mb-2 inline-flex w-full rounded transition bg-lightGrey cursor-pointer hover:bg-mainPurple hover:bg-opacity-25 dark:text-white dark:bg-veryDarkGrey dark:hover:bg-mainPurple dark:hover:bg-opacity-25`}
        >
          <input
            id={`${subtask}-${i}`}
            type="checkbox"
            checked={subtask.isCompleted}
            className="mr-3 accent-mainPurple"
            onChange={() => toggleSubtask(subtask, i)}
          />
          <span
            className={`${
              subtask.isCompleted ? "opacity-50 line-through" : "opacity-100"
            } transition`}
          >
            {subtask.title}
          </span>
        </label>
      ))}

      <StatusDropdown label="Current Status" data={data}/>
    </div>
  );
};
export default TaskDetailModal;
