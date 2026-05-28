/**
 * SCHROOL API Client
 * JavaScript library for connecting HTML dashboards to the backend tRPC API
 */

class SchroolAPI {
  constructor() {
    this.baseURL = window.location.origin + '/api/trpc';
    this.token = this.getAuthToken();
  }

  /**
   * Get authentication token from localStorage
   */
  getAuthToken() {
    return localStorage.getItem('schrool_auth_token');
  }

  /**
   * Set authentication token
   */
  setAuthToken(token) {
    localStorage.setItem('schrool_auth_token', token);
    this.token = token;
  }

  /**
   * Clear authentication token (logout)
   */
  clearAuthToken() {
    localStorage.removeItem('schrool_auth_token');
    this.token = null;
  }

  /**
   * Make a tRPC query request
   */
  async query(procedure, input = null) {
    const url = new URL(`${this.baseURL}/${procedure}`);
    if (input) {
      url.searchParams.set('input', JSON.stringify(input));
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for JWT
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result.data;
  }

  /**
   * Make a tRPC mutation request
   */
  async mutate(procedure, input) {
    const response = await fetch(`${this.baseURL}/${procedure}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result.data;
  }

  // ========== AUTH APIs ==========

  async getCurrentUser() {
    return await this.query('auth.me');
  }

  async logout() {
    await this.mutate('auth.logout', {});
    this.clearAuthToken();
  }

  // ========== LESSONS APIs ==========

  async getAllLessons() {
    return await this.query('lessons.list');
  }

  async getLessonById(lessonId) {
    return await this.query('lessons.getById', { lessonId });
  }

  async getExercises(lessonId) {
    return await this.query('lessons.getExercises', { lessonId });
  }

  // ========== PROGRESS APIs ==========

  async getUserProgress() {
    return await this.query('progress.getUserProgress');
  }

  async getLessonProgress(lessonId) {
    return await this.query('progress.getLessonProgress', { lessonId });
  }

  async updateProgress(lessonId, correctAnswers, totalAttempts, completed) {
    return await this.mutate('progress.updateProgress', {
      lessonId,
      correctAnswers,
      totalAttempts,
      completed,
    });
  }

  async canProgress(lessonId) {
    return await this.query('progress.canProgress', { lessonId });
  }

  // ========== RESOURCES APIs ==========

  async getResources(category) {
    return await this.query('resources.list', category ? { category } : null);
  }

  async uploadResource(title, description, category, fileUrl, fileKey, targetRole) {
    return await this.mutate('resources.upload', {
      title,
      description,
      category,
      fileUrl,
      fileKey,
      targetRole,
    });
  }

  async deleteResource(resourceId) {
    return await this.mutate('resources.delete', { resourceId });
  }

  // ========== HELPER METHODS ==========

  /**
   * Get Bunny.net video embed URL
   */
  getBunnyVideoURL(videoId, autoplay = true) {
    return `https://iframe.mediadelivery.net/embed/333193/${videoId}?autoplay=${autoplay}&preload=true`;
  }

  /**
   * Calculate progress percentage
   */
  calculateProgressPercentage(completed, total) {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  /**
   * Check if 8/10 rule is met
   */
  meetsProgressionRule(correctAnswers) {
    return correctAnswers >= 8;
  }
}

// Create global API instance
window.schroolAPI = new SchroolAPI();

// Export for use in dashboards
console.log('✅ SCHROOL API Client loaded successfully');
