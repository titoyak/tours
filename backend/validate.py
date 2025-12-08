"""
Syntax and structure validation for the Conversation Tree system
This test doesn't require dependencies to be installed
"""

import ast
import os

def check_python_syntax(filepath):
    """Check if a Python file has valid syntax"""
    try:
        with open(filepath, 'r') as f:
            ast.parse(f.read())
        return True, None
    except SyntaxError as e:
        return False, str(e)


def test_backend_syntax():
    """Test that all backend Python files have valid syntax"""
    backend_dir = os.path.dirname(__file__)
    python_files = ['main.py', 'models.py', 'schemas.py', 'database.py']
    
    all_valid = True
    for filename in python_files:
        filepath = os.path.join(backend_dir, filename)
        valid, error = check_python_syntax(filepath)
        
        if valid:
            print(f"✓ {filename}: Valid syntax")
        else:
            print(f"✗ {filename}: Syntax error - {error}")
            all_valid = False
    
    return all_valid


def check_required_endpoints():
    """Check that main.py defines required endpoints"""
    with open('main.py', 'r') as f:
        content = f.read()
    
    required_endpoints = [
        '@app.post("/nodes/"',
        '@app.get("/nodes/"',
        '@app.get("/nodes/roots"',
        '@app.get("/nodes/{node_id}"',
        '@app.get("/nodes/{node_id}/tree"',
        '@app.get("/nodes/{node_id}/path"',
        '@app.get("/nodes/{node_id}/children"',
        '@app.put("/nodes/{node_id}"',
        '@app.delete("/nodes/{node_id}"',
        '@app.get("/tree/full"',
        '@app.get("/tree/stats"',
        '@app.post("/demo/init"'
    ]
    
    all_present = True
    for endpoint in required_endpoints:
        if endpoint in content:
            print(f"✓ Endpoint defined: {endpoint}")
        else:
            print(f"✗ Missing endpoint: {endpoint}")
            all_present = False
    
    return all_present


def check_model_structure():
    """Check that models.py defines ConversationNode"""
    with open('models.py', 'r') as f:
        content = f.read()
    
    required_elements = [
        'class ConversationNode',
        '__tablename__ = "conversation_nodes"',
        'def to_dict',
        'def to_dict_with_children'
    ]
    
    all_present = True
    for element in required_elements:
        if element in content:
            print(f"✓ Model element present: {element}")
        else:
            print(f"✗ Missing model element: {element}")
            all_present = False
    
    return all_present


if __name__ == '__main__':
    print("=" * 60)
    print("Conversation Tree System - Validation Tests")
    print("=" * 60)
    print()
    
    print("1. Checking Python syntax...")
    print("-" * 60)
    syntax_ok = test_backend_syntax()
    print()
    
    print("2. Checking API endpoints...")
    print("-" * 60)
    endpoints_ok = check_required_endpoints()
    print()
    
    print("3. Checking model structure...")
    print("-" * 60)
    model_ok = check_model_structure()
    print()
    
    print("=" * 60)
    if syntax_ok and endpoints_ok and model_ok:
        print("✓ All validation tests passed!")
        print("=" * 60)
        exit(0)
    else:
        print("✗ Some validation tests failed")
        print("=" * 60)
        exit(1)
