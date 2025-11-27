// Session Manager for Multi-Window Support
export class SessionManager {
  private static sessionId: string = '';

  static initSession() {
    // Generate unique session ID for each window
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sessionId', this.sessionId);
  }

  static getSessionKey(key: string): string {
    const sessionId = sessionStorage.getItem('sessionId') || this.sessionId;
    return `${sessionId}_${key}`;
  }

  static setItem(key: string, value: string) {
    localStorage.setItem(this.getSessionKey(key), value);
  }

  static getItem(key: string): string | null {
    return localStorage.getItem(this.getSessionKey(key));
  }

  static removeItem(key: string) {
    localStorage.removeItem(this.getSessionKey(key));
  }

  static clearSession() {
    const sessionId = sessionStorage.getItem('sessionId');
    if (sessionId) {
      // Remove all items for this session
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`${sessionId}_`)) {
          localStorage.removeItem(key);
        }
      });
    }
  }
}