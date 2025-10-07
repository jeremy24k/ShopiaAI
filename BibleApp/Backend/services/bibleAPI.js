const axios = require('axios');

const BASE_URL = 'https://bible.helloao.org/api';

class BibleAPIService {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Obtener todas las traducciones disponibles
  async getAvailableTranslations() {
    try {
      const response = await this.client.get('/available_translations.json');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener libros de una traducción específica
  async getBooks(translation) {
    try {
      const response = await this.client.get(`/${translation}/books.json`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener un capítulo específico (versículos)
  async getChapter(translation, book, chapter) {
    try {
      const response = await this.client.get(`/${translation}/${book}/${chapter}.json`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener comentarios disponibles
  async getAvailableCommentaries() {
    try {
      const response = await this.client.get('/available_commentaries.json');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener libros de un comentario específico
  async getCommentaryBooks(commentary) {
    try {
      const response = await this.client.get(`/${commentary}/books.json`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener comentario de un capítulo específico
  async getCommentaryChapter(commentary, book, chapter) {
    try {
      const response = await this.client.get(`/${commentary}/${book}/${chapter}.json`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener perfiles de un comentario
  async getCommentaryProfiles(commentary) {
    try {
      const response = await this.client.get(`/${commentary}/profiles.json`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener un perfil específico de un comentario
  async getCommentaryProfile(commentary, profile) {
    try {
      const response = await this.client.get(`/${commentary}/profiles/${profile}.json`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new BibleAPIService();
