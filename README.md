# Audit Management System

The **Audit Management System** is a web application designed to help organizations plan, execute, and track audits efficiently. It allows users to manage audit plans, upload and review evidence, assign actions, generate reports, and ensure compliance with internal or external standards. The system supports user roles, notifications, file management, and multilingual interfaces, making it suitable for teams of any size.

## Setup Instructions

### 1. Clone the Repository

```sh
git clone <your-repo-url>
cd audit-management-system
```

### 2. Create and Activate a Virtual Environment

```sh
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Python Dependencies

```sh
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Install Node.js Dependencies for the UI (if applicable)

```sh
cd ui
npm install
cd ..
```

### 5. Apply Database Migrations

```sh
python manage.py makemigrations
python manage.py migrate
```

### 6. Create a Superuser

```sh
python manage.py createsuperuser
```

### 7. Collect Static Files

```sh
python manage.py collectstatic
```

### 8. Run the Development Server

```sh
python manage.py runserver
```

### 9. Run the UI (if applicable)

```sh
cd ui
npm start
```

---

## Additional Commands

- **Run tests:**  
  ```sh
  python manage.py test
  ```

- **Format code with Black:**  
  ```sh
  black .
  ```

- **Compile translation files:**  
  ```sh
  python manage.py compilemessages
  ```

- **Pre-commit hooks:**  
  Install and run pre-commit hooks for code formatting and linting:
  ```sh
  pip install pre-commit
  pre-commit install
  pre-commit run --all-files
  ```

---

## Notes

- Make sure you have Python 3.8+ and Node.js installed.
- Activate your virtual environment before running any Django commands.
- For translation, ensure you have the necessary `.po` and compiled `.mo` files in `locale/`.

---