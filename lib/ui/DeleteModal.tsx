import { Fragment, useState } from "react";
import Icon from "@/lib/ui/Icon";
import Button from "@/lib/ui/Button";
import { Dialog, Transition } from "@headlessui/react";

type DialogProps = {
  action: () => void;
};

export default function DeleteModal(props: DialogProps) {
  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function completeAction() {
    setIsOpen(false);
    props.action();
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Icon icon="GoTrashcan" />
      </Button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-salt dark:bg-slate p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-xl font-medium leading-6 text-primary">
                    Are you sure you want to delete this item?
                  </Dialog.Title>
                  <div className="my-5">
                    <p className="text-base text-slate dark:text-salt">
                      This action cannot be undone. After you confirm this will be permanently deleted.
                    </p>
                  </div>

                  <div className="my-2 flex justify-between">
                    <Button onClick={completeAction}>Confirm</Button>
                    <Button onClick={closeModal} color="bg-slate dark:bg-salt text-salt dark:text-slate">
                      Cancel
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
