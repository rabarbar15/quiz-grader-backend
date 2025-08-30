let activeController: AbortController | null = null;

export const setActiveRequest = (controller: AbortController) => {
  activeController = controller;
};

export const cancelActiveRequest = (): boolean => {
  if (activeController) {
    activeController.abort();
    activeController = null;
    return true;
  }
  return false;
};

export const clearActiveRequest = () => {
  activeController = null;
};
