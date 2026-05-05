import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FileText, Table, FileSpreadsheet, X, Download } from "lucide-react";

export default function ReportExportModal({ isOpen, onClose, onExport }) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-[2.5rem] bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-8 border border-gray-100 dark:border-gray-700">
                <div className="absolute right-6 top-6">
                  <button
                    type="button"
                    className="rounded-full bg-gray-50 dark:bg-gray-700 p-2 text-gray-400 hover:text-gray-500 transition-colors"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                    <Download className="h-7 w-7" />
                  </div>
                  <div className="mt-6 text-center">
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-black leading-6 text-gray-900 dark:text-white"
                    >
                      Export Report
                    </Dialog.Title>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Select a format to download your recruitment report.
                    </p>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <button
                    onClick={() => onExport("pdf")}
                    className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:border-red-500/50 transition-all group"
                  >
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      PDF
                    </span>
                  </button>

                  <button
                    onClick={() => onExport("csv")}
                    className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 dark:hover:border-green-500/50 transition-all group"
                  >
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
                      <Table className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      CSV
                    </span>
                  </button>

                  <button
                    onClick={() => onExport("excel")}
                    className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:border-blue-500/50 transition-all group"
                  >
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      Excel
                    </span>
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
