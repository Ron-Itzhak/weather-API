# Weather API

## **API URL address**

```bash
https://github.com/tomorrow-code-challenge/tmw-home-test-Ron-Itzhak
```

## **Setup Instructions**

Follow these steps to set up the application:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/tomorrow-code-challenge/tmw-home-test-Ron-Itzhak
   cd api
   ```

2. **Install**:
   You can run the server with docker-compose that contains mongodb:

   ```bash
      docker-compose up --build
   ```

   Open [http://localhost:9000](http://localhost:9000) with your browser to see the API.

   the API with node.js and database is MongoDB.

---

## **Implemented Features**

### **Core Features**

1. **Ingestion Proccess**:

   - /batches/ingest - start ingestion proccess inside the API

2. **API**:

   - /batches - get all batches metadata
   - /weather/data - get all batches metadata
   - /weather/summarize - get all batches metadata

## **Production service Improvements**

1. **Status**:

   - improve status options,for failed batches.
   - Use a queue with messages in order to simultaneously do the batches while using cloud functions such as lambda to read from external API and write to the databse more pages at the same time and create a more robust solution for retry mecahnizem.
