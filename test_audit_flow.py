#!/usr/bin/env python
"""
Test script to verify the complete audit flow functionality
Run this after starting the Django server to test all features
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:8000/api"
USERNAME = "admin"  # Replace with your username
PASSWORD = "admin"  # Replace with your password

class AuditFlowTester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.audit_id = None
        self.task_id = None
        
    def authenticate(self):
        """Authenticate and get token"""
        print("🔐 Authenticating...")
        try:
            response = self.session.post(f"{BASE_URL}/auth/login/", {
                "username": USERNAME,
                "password": PASSWORD
            })
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('token') or data.get('access') or data.get('key')
                if self.token:
                    self.session.headers.update({'Authorization': f'Token {self.token}'})
                    print("✅ Authentication successful")
                    return True
            print(f"❌ Authentication failed: {response.status_code}")
            return False
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return False
    
    def test_audit_creation(self):
        """Test audit creation"""
        print("\n🏗️ Testing audit creation...")
        audit_data = {
            "title": "Test Complex Audit Flow",
            "audit_type": "financial",
            "scope": "Complete test of audit management system",
            "objectives": "Verify all features work correctly",
            "period_from": "2024-01-01",
            "period_to": "2024-12-31",
            "assigned_users": []
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/audits/audits/", json=audit_data)
            if response.status_code == 201:
                data = response.json()
                self.audit_id = data['id']
                print(f"✅ Audit created successfully (ID: {self.audit_id}, Ref: {data['reference_number']})")
                return True
            else:
                print(f"❌ Audit creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Audit creation error: {e}")
            return False
    
    def test_template_listing(self):
        """Test getting available templates"""
        print("\n📋 Testing template listing...")
        try:
            response = self.session.get(f"{BASE_URL}/audits/audits/{self.audit_id}/task_templates/")
            if response.status_code == 200:
                templates = response.json()
                print(f"✅ Found {len(templates)} templates available")
                for template in templates[:3]:  # Show first 3
                    print(f"   - {template['name']} ({template['field_count']} fields)")
                return templates
            else:
                print(f"❌ Template listing failed: {response.status_code}")
                return []
        except Exception as e:
            print(f"❌ Template listing error: {e}")
            return []
    
    def test_task_creation(self, templates):
        """Test task creation"""
        print("\n🎯 Testing task creation...")
        if not templates:
            print("❌ No templates available for task creation")
            return False
            
        task_data = {
            "template_id": templates[0]['id'],
            "task_name": "Test Financial Controls Review",
            "description": "Testing task creation functionality",
            "priority": "high",
            "control_area": "Financial Reporting",
            "risk_level": "medium",
            "due_date": (datetime.now() + timedelta(days=7)).isoformat()
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/audits/audits/{self.audit_id}/tasks/", json=task_data)
            if response.status_code == 201:
                data = response.json()
                self.task_id = data['id']
                print(f"✅ Task created successfully (ID: {self.task_id})")
                print(f"   - Checklist ID: {data['checklist']['id']}")
                print(f"   - Progress: {data['completion_percentage']}%")
                return True
            else:
                print(f"❌ Task creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Task creation error: {e}")
            return False
    
    def test_task_details(self):
        """Test getting task details"""
        print("\n🔍 Testing task details...")
        try:
            response = self.session.get(f"{BASE_URL}/audits/audit-tasks/{self.task_id}/")
            if response.status_code == 200:
                data = response.json()
                print("✅ Task details retrieved successfully")
                print(f"   - Status: {data['task_status']}")
                print(f"   - Progress: {data['completion_percentage']}%")
                print(f"   - Checklist Fields: {data['checklist']['total_fields']}")
                return data
            else:
                print(f"❌ Task details failed: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ Task details error: {e}")
            return None
    
    def test_checklist_responses(self, task_data):
        """Test checklist response functionality"""
        print("\n📝 Testing checklist responses...")
        if not task_data or 'checklist' not in task_data:
            print("❌ No checklist data available")
            return False
            
        checklist_id = task_data['checklist']['id']
        
        try:
            # Get checklist responses
            response = self.session.get(f"{BASE_URL}/checklists/checklists/{checklist_id}/responses/")
            if response.status_code == 200:
                responses = response.json()
                print(f"✅ Found {len(responses)} checklist fields")
                
                if responses:
                    # Submit a response for the first field
                    first_field = responses[0]
                    response_data = {
                        "field_id": first_field['field']['id'],
                        "value": {"text": "Test response - all controls verified"},
                        "is_completed": True,
                        "comments": "This is a test response to verify functionality"
                    }
                    
                    submit_response = self.session.post(
                        f"{BASE_URL}/checklists/checklists/{checklist_id}/submit_response/",
                        json=response_data
                    )
                    
                    if submit_response.status_code in [200, 201]:
                        print("✅ Response submitted successfully")
                        return True
                    else:
                        print(f"❌ Response submission failed: {submit_response.status_code}")
                        return False
                return True
            else:
                print(f"❌ Checklist responses failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Checklist responses error: {e}")
            return False
    
    def test_progress_tracking(self):
        """Test progress tracking"""
        print("\n📊 Testing progress tracking...")
        try:
            response = self.session.get(f"{BASE_URL}/audits/audits/{self.audit_id}/task_summary/")
            if response.status_code == 200:
                data = response.json()
                print("✅ Progress tracking working")
                print(f"   - Total Tasks: {data['total_tasks']}")
                print(f"   - Progress: {data['progress']['percentage']}%")
                print(f"   - Breakdown: {data['breakdown']['by_status']}")
                return True
            else:
                print(f"❌ Progress tracking failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Progress tracking error: {e}")
            return False
    
    def test_evidence_upload(self):
        """Test evidence upload (mock)"""
        print("\n📎 Testing evidence upload...")
        evidence_data = {
            "title": "Test Evidence Document",
            "description": "Testing evidence upload functionality",
            "evidence_type": "document"
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/audits/audit-tasks/{self.task_id}/evidence/", json=evidence_data)
            if response.status_code == 201:
                print("✅ Evidence upload successful")
                return True
            else:
                print(f"❌ Evidence upload failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Evidence upload error: {e}")
            return False
    
    def test_review_workflow(self):
        """Test review workflow"""
        print("\n👥 Testing review workflow...")
        try:
            # Submit for review
            response = self.session.post(f"{BASE_URL}/audits/audit-tasks/{self.task_id}/submit-for-review/")
            if response.status_code == 200:
                print("✅ Task submitted for review")
                
                # Approve task
                approve_response = self.session.post(
                    f"{BASE_URL}/audits/audit-tasks/{self.task_id}/approve/",
                    json={"notes": "Test approval - everything looks good"}
                )
                
                if approve_response.status_code == 200:
                    print("✅ Task approved successfully")
                    return True
                else:
                    print(f"❌ Task approval failed: {approve_response.status_code}")
                    return False
            else:
                print(f"❌ Review submission failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Review workflow error: {e}")
            return False
    
    def test_findings_creation(self):
        """Test findings creation"""
        print("\n🔍 Testing findings creation...")
        finding_data = {
            "title": "Test Finding - Control Weakness",
            "description": "This is a test finding to verify the findings functionality",
            "severity": "medium",
            "finding_type": "control_deficiency",
            "control_area": "Test Controls",
            "risk_level": "medium"
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/audits/audit-tasks/{self.task_id}/findings/", json=finding_data)
            if response.status_code == 201:
                print("✅ Finding created successfully")
                return True
            else:
                print(f"❌ Finding creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Finding creation error: {e}")
            return False
    
    def cleanup(self):
        """Clean up test data"""
        print("\n🧹 Cleaning up test data...")
        try:
            if self.audit_id:
                response = self.session.delete(f"{BASE_URL}/audits/audits/{self.audit_id}/")
                if response.status_code == 204:
                    print("✅ Test audit deleted successfully")
                else:
                    print(f"⚠️ Could not delete test audit: {response.status_code}")
        except Exception as e:
            print(f"⚠️ Cleanup error: {e}")
    
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Complete Audit Flow Tests")
        print("=" * 50)
        
        # Authenticate first
        if not self.authenticate():
            return False
        
        # Run tests in sequence
        success = True
        success &= self.test_audit_creation()
        
        if success:
            templates = self.test_template_listing()
            success &= self.test_task_creation(templates)
            
            if success:
                task_data = self.test_task_details()
                success &= self.test_checklist_responses(task_data)
                success &= self.test_progress_tracking()
                success &= self.test_evidence_upload()
                success &= self.test_review_workflow()
                success &= self.test_findings_creation()
        
        # Summary
        print("\n" + "=" * 50)
        if success:
            print("🎉 All tests PASSED! The audit system is working perfectly!")
            print("\n✅ Verified Features:")
            print("   • Audit creation and management")
            print("   • Template-based task creation")
            print("   • Checklist response handling")
            print("   • Progress tracking and reporting")
            print("   • Evidence management")
            print("   • Review and approval workflow")
            print("   • Findings creation and tracking")
        else:
            print("❌ Some tests FAILED. Please check the errors above.")
        
        # Cleanup
        self.cleanup()
        
        return success

if __name__ == "__main__":
    tester = AuditFlowTester()
    tester.run_all_tests() 