# Jano - Tu Asistente Documental Inteligente

Bienvenido a **Jano**, una aplicación diseñada para transformar la forma en que interactúas con tus documentos. Carga tus archivos y conversa con ellos utilizando el poder de la Inteligencia Artificial.

![Imagen Principal de la App](AQUÍ_TU_IMAGEN_PRINCIPAL.png)

## 🚀 ¿Qué hace esta aplicación?

Jano actúa como un puente inteligente entre tú y tu información:

- **Sube tus Documentos**: Carga archivos PDF y otros formatos directamente a la plataforma.
- **Chatea con tus Datos**: Haz preguntas sobre el contenido de tus documentos y obtén respuestas contextuales precisas.
- **Espacio Personalizado**: Cada usuario tiene su propia cuenta, historial de chats y documentos privados.
- **Multilenguaje**: Disfruta de la aplicación en tu idioma preferido.

---

## 🛠️ Detalles Técnicos

Para los interesados en lo que ocurre "bajo el capó", Jano está construido con una arquitectura robusta y moderna:

### Backend y Datos
- **Base de Datos Vectorial**: Utilizamos **pgvector** sobre PostgreSQL para almacenar embeddings y realizar búsquedas semánticas de alto rendimiento.
- **Almacenamiento S3**: Los documentos físicos se guardan de forma segura en almacenamiento compatible con S3 (MinIO/AWS).
- **FastAPI**: El núcleo del servidor está construido con Python y FastAPI, garantizando velocidad y tipado fuerte.
- **Pydantic-AI**: Orquestación de agentes y lógica de IA estructurada.

### Frontend
- **React + Vite**: Interfaz de usuario rápida y reactiva.
- **i18next**: Sistema completo de internacionalización.
- **Diseño Moderno**: Estética cuidada con soporte para modo oscuro y componentes interactivos.

## 🐳 Despliegue

La aplicación está contenerizada para facilitar su despliegue en cualquier entorno.

```bash
docker-compose up -d --build
```
