import React from 'react'

import { Trash2 } from 'lucide-react'

import { Modal } from '../custom/modal/modal'

interface DeleteModalProps {
  show: boolean
  handleHide: () => void
  deleteModalFunction: () => void
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  show,
  handleHide,
  deleteModalFunction,
}) => {
  return (
    <React.Fragment>
      <Modal
        isOpen={show}
        id="deleteModal"
        onClose={handleHide}
        position="modal-center"
        size="modal-xs"
        isFooter={true}
        content={(onClose) => (
          <>
            <div className="text-center p-7">
              <div className="flex items-center justify-center mx-auto mb-4 text-red-500 rounded-full bg-red-500/10 size-14 backdrop-blur-xl">
                <Trash2 className="size-6" />
              </div>
              <h5 className="mb-4">
                Are you sure you want to delete this Contact ?
              </h5>
              <div className="flex items-center justify-center gap-2">
                <button
                  className="btn btn-red"
                  onClick={() => {
                    deleteModalFunction()
                    onClose()
                  }}>
                  Delete
                </button>
                <button className="btn link link-primary" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}
      />
    </React.Fragment>
  )
}

export default DeleteModal
