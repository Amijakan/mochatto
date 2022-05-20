import React, { useState } from 'react'

const SideBar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <div className="sidebar" data-open={isOpen ? "open" : "close"}>{isOpen ? <>Open</> : <>Close</>}</div>
  )

}
