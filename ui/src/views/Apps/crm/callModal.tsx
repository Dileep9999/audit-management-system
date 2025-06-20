import { Modal } from "@src/components/custom/modal/modal";
import { Disc, Mic, MicOff, Pause, Phone, Settings } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Message {
  _id: number;
  sender: "agent" | "user";
  text: string;
}

interface DealItem {
  image: string;
  projectName: string;
  createDate: string;
  endDate: string;
  amount: string;
  company: string;
  content: string;
  status: string;
  userimage: string;
  messages: Message[];
}

interface callmodalItem {
  open: boolean;
  closeModal: any;
  selectedDeal: DealItem | null;
}

const CallModal = ({ open, closeModal, selectedDeal }: callmodalItem) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCalling, setIsCalling] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const toggleMute = () => {
    setIsMuted((prevState) => !prevState);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  useEffect(() => {
    let callingTimeout: NodeJS.Timeout;
    let timer: NodeJS.Timeout;

    if (open) {
      setIsCalling(true);
      setCallDuration(0);

      callingTimeout = setTimeout(() => {
        setIsCalling(false);

        timer = setInterval(() => {
          setCallDuration((prevDuration) => prevDuration + 1);
        }, 1000);
      }, 3000);
    }
    return () => {
      clearTimeout(callingTimeout);
      clearInterval(timer);
    };
  }, [open]);

  return (
    <React.Fragment>
      <Modal
        isOpen={open}
        onClose={() => closeModal()}
        position="modal-br"
        id="callModal"
        contentClass="modal-content"
        size="modal-xs"
        content={(onClose) => (
          <>
            {selectedDeal && (
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 border border-gray-200 rounded-md dark:border-dark-800 size-12 shrink-0">
                    <img
                      src={selectedDeal.userimage}
                      alt="userimage"
                      height={30}
                      width={30}
                    />
                  </div>
                  <div>
                    <h6>{selectedDeal.projectName}</h6>
                    <p className="text-sm text-gray-500 dark:text-dark-500">
                      {isCalling ? "Calling ..." : formatDuration(callDuration)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-5">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="btn btn-active-gray shrink-0 btn-icon-text btn-icon"
                  >
                    {isMuted ? (
                      <MicOff className="size-5" />
                    ) : (
                      <Mic className="size-5" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-active-gray shrink-0 btn-icon-text btn-icon"
                  >
                    <Pause className="size-5" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-active-gray shrink-0 btn-icon-text btn-icon"
                  >
                    <Disc className="size-5" />
                  </button>
                  <button
                    type="button"
                    data-modal-close="callModal"
                    onClick={onClose}
                    className="btn btn-active-red shrink-0 btn-icon-text btn-icon"
                  >
                    <Phone className="size-5"></Phone>
                  </button>
                  <button
                    onClick={onClose}
                    type="button"
                    className="btn btn-active-gray shrink-0 btn-icon-text btn-icon"
                  >
                    <Settings className="size-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      />
    </React.Fragment>
  );
};

export default CallModal;
