import { formatDate } from 'date-fns'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ShowInfo = ({ selectedUserInfo }: { selectedUserInfo: any }) => {
  return (
    <div className="mx-2 flex flex-col gap-2 text-gray-700 dark:text-gray-300 text-sm">
      <div className="flex justify-between">
        <span>Account Created:</span>
        <span>{formatDate(selectedUserInfo?.createdAt as Date, "MMMM dd,yyyy")}</span>
      </div>
    </div>
  )
}

export default ShowInfo