# locustfile.py
# Usage: locust -f locustfile.py
# This script simulates concurrent students logging in, fetching their dashboard,
# course records, and recommendations to verify backend performance under load.

import random
from locust import HttpUser, task, between

class GraduationSystemUser(HttpUser):
    # Simulate a user thinking for 1 to 3 seconds between tasks
    wait_time = between(1, 3)

    def on_start(self):
        """ Runs when a simulated user starts: Logs in and gets an access token """
        self.student_id = "110306078"
        self.password = "password123"
        self.token = ""
        self.login()

    def login(self):
        # Request a JWT token from the backend
        payload = {
            "username": self.student_id,
            "password": self.password
        }
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        response = self.client.post("/auth/login", data=payload, headers=headers)
        if response.status_code == 200:
            self.token = response.json().get("access_token")
            # Set global headers with Bearer Token
            self.auth_headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            }
        else:
            print(f"Login failed for student {self.student_id}")

    @task(3)
    def view_dashboard(self):
        """ Simulates viewing the dashboard (makes parallel checks) """
        if not self.token:
            return
            
        # Get student profile
        self.client.get(f"/students/{self.student_id}", headers=self.auth_headers)
        
        # Get credit check status
        self.client.get("/credit-check/me", headers=self.auth_headers)
        
        # Get course records
        self.client.get("/student-course-records/me", headers=self.auth_headers)

    @task(2)
    def view_recommendations(self):
        """ Simulates fetching recommended courses """
        if not self.token:
            return
        self.client.get(f"/recommendations/{self.student_id}", headers=self.auth_headers)

    @task(1)
    def add_and_remove_record(self):
        """ Simulates dynamic modifications: adds a mock course record and immediately deletes it """
        if not self.token:
            return
            
        # 1. Add course record
        payload = {
            "student_id": self.student_id,
            "course_id": f"TEST{random.randint(100, 999)}",
            "semester": "112學年度第二學期",
            "grade": 85,
            "is_passed": True
        }
        # First ensure the course exists in the database
        course_payload = {
            "course_id": payload["course_id"],
            "course_name": "壓力測試模擬課程",
            "credits": 3
        }
        self.client.post("/courses/", json=course_payload, headers=self.auth_headers)
        
        # Add category mapping (e.g. elective: 2)
        mapping_payload = {
            "course_id": payload["course_id"],
            "category_id": 2
        }
        self.client.post("/course-category-mappings/", json=mapping_payload, headers=self.auth_headers)

        # Add course record
        response = self.client.post("/student-course-records/", json=payload, headers=self.auth_headers)
        if response.status_code == 200:
            record_id = response.json().get("record_id")
            if record_id:
                # 2. Delete course record to keep database clean
                self.client.delete(f"/student-course-records/{record_id}", headers=self.auth_headers)
