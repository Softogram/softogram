import requests
import sys
from datetime import datetime
import json

class SoftogramAPITester:
    def __init__(self, base_url="https://code-delivered.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": test_name,
            "status": "PASS" if success else "FAIL", 
            "details": details
        }
        self.test_results.append(result)
        
        status_icon = "✅" if success else "❌"
        print(f"{status_icon} {test_name}: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            else:
                self.log_result(name, False, f"Unsupported method: {method}")
                return False, {}

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json() if response.text else {}
                    self.log_result(name, True, f"Status: {response.status_code}")
                    return True, response_data
                except json.JSONDecodeError:
                    self.log_result(name, True, f"Status: {response.status_code} (non-JSON response)")
                    return True, {}
            else:
                try:
                    error_data = response.json() if response.text else {"error": "No response body"}
                    self.log_result(name, False, f"Expected {expected_status}, got {response.status_code}. Error: {error_data}")
                except json.JSONDecodeError:
                    self.log_result(name, False, f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:200]}")
                return False, {}

        except requests.exceptions.RequestException as e:
            self.log_result(name, False, f"Request error: {str(e)}")
            return False, {}
        except Exception as e:
            self.log_result(name, False, f"Unexpected error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        
        if success and response:
            if "message" in response:
                self.log_result("Root Response Format", True, f"Message: {response['message']}")
                return True
            else:
                self.log_result("Root Response Format", False, "Missing 'message' field in response")
        return success

    def test_contact_form_submission(self):
        """Test contact form submission"""
        test_data = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": "test@example.com",
            "phone": "+91-9876543210", 
            "service": "Custom Web Application",
            "message": "This is a test message for API testing"
        }

        success, response = self.run_test(
            "Contact Form Submission",
            "POST", 
            "contact",
            200,
            data=test_data
        )
        
        if success and response:
            if response.get("status") == "success":
                self.log_result("Contact Response Format", True, f"Message: {response.get('message')}")
                return True
            else:
                self.log_result("Contact Response Format", False, f"Expected status 'success', got: {response}")
        return success

    def test_contact_form_validation(self):
        """Test contact form validation with missing fields"""
        incomplete_data = {
            "name": "Test User",
            "email": "invalid-email"
            # Missing required fields
        }

        success, response = self.run_test(
            "Contact Form Validation",
            "POST",
            "contact", 
            422,  # Expecting validation error
            data=incomplete_data
        )
        return success

    def test_get_contact_submissions(self):
        """Test getting contact submissions"""
        success, response = self.run_test(
            "Get Contact Submissions",
            "GET",
            "contact",
            200
        )
        
        if success:
            if isinstance(response, list):
                self.log_result("Contact Submissions Format", True, f"Received {len(response)} submissions")
                return True
            else:
                self.log_result("Contact Submissions Format", False, f"Expected list, got: {type(response)}")
        return success

    def test_status_endpoint(self):
        """Legacy /api/status was removed (issue #6); expect 404."""
        success, _ = self.run_test(
            "Get Status Checks Gone",
            "GET",
            "status",
            404,
        )
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print(f"\n🔍 Starting Softogram API Tests...")
        print(f"🌐 Base URL: {self.base_url}")
        print("="*50)

        # Run tests
        self.test_root_endpoint()
        self.test_contact_form_submission() 
        self.test_contact_form_validation()
        self.test_get_contact_submissions()
        self.test_status_endpoint()

        # Print summary
        print("="*50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    tester = SoftogramAPITester()
    success = tester.run_all_tests()
    
    # Print detailed results for debugging
    print("\n📋 Detailed Results:")
    for result in tester.test_results:
        print(f"  {result['status']}: {result['test']} - {result['details']}")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())