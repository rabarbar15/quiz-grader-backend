class RequestManager {
  private activeTasks: Map<string, AbortController> = new Map();

  setActiveTask(quizId: string, controller: AbortController) {
    this.activeTasks.set(quizId, controller);
  }

  cancelActiveTask(quizId: string): boolean {
    const controller = this.activeTasks.get(quizId);
    if (controller) {
      controller.abort();
      this.clearActiveTask(quizId);
      return true;
    }
    return false;
  }

  clearActiveTask(quizId: string) {
    this.activeTasks.delete(quizId);
  }
}

export default new RequestManager();
