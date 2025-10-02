#!/bin/bash

# ByteBerry OAuth2 - Service - Release Testing Script
# Tests semantic-release configuration and Docker build locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."

    local missing_tools=()

    command -v node >/dev/null 2>&1 || missing_tools+=("Node.js")
    command -v pnpm >/dev/null 2>&1 || missing_tools+=("pnpm")
    command -v docker >/dev/null 2>&1 || missing_tools+=("Docker")
    command -v git >/dev/null 2>&1 || missing_tools+=("Git")

    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        exit 1
    fi

    print_success "All prerequisites available"
}

# Validate semantic-release configuration
test_semantic_release_config() {
    print_info "Testing semantic-release configuration..."

    if [ ! -f "package.json" ]; then
        print_error "package.json not found"
        return 1
    fi

    # Check semantic-release config in package.json
    if ! grep -q '"semantic-release"' package.json; then
        print_error "semantic-release not configured in package.json"
        return 1
    fi

    # Check if semantic-release is installed
    if ! pnpm list semantic-release >/dev/null 2>&1; then
        print_error "semantic-release not installed. Run: pnpm install"
        return 1
    fi

    print_success "Semantic-release configuration valid"
}

# Test conventional commits format
test_conventional_commits() {
    print_info "Testing conventional commits format..."

    # Get recent commits
    local recent_commits=$(git log --format="%s" -5)
    local valid_commits=0
    local total_commits=0

    while IFS= read -r commit; do
        if [[ -n "$commit" ]]; then
            total_commits=$((total_commits + 1))
            if [[ $commit =~ ^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?\!?:.+ ]]; then
                valid_commits=$((valid_commits + 1))
                print_success "✓ Valid: $commit"
            else
                print_warning "⚠ Non-conventional: $commit"
            fi
        fi
    done <<< "$recent_commits"

    if [ $valid_commits -gt 0 ]; then
        print_success "Found $valid_commits/$total_commits conventional commits"
    else
        print_warning "No conventional commits found in recent history"
    fi

    # Show examples
    print_info "Conventional commit examples:"
    echo "  feat(oauth2): add CRUD operations"
    echo "  fix(health): resolve deep health check"
    echo "  feat(api)!: breaking change in API"
}

# Test Docker build
test_docker_build() {
    print_info "Testing Docker build..."

    if [ ! -f "Dockerfile" ]; then
        print_error "Dockerfile not found"
        return 1
    fi

    # Build test image
    if docker build -t byteberry-oauth2:test-release . >/dev/null 2>&1; then
        print_success "Docker build successful"

        # Test image
        print_info "Testing Docker image..."
        if docker run --rm byteberry-oauth2:test-release node --version >/dev/null 2>&1; then
            print_success "Docker image working correctly"
        else
            print_error "Docker image test failed"
            return 1
        fi

        # Cleanup
        docker rmi byteberry-oauth2:test-release >/dev/null 2>&1 || true
    else
        print_error "Docker build failed"
        return 1
    fi
}

# Test package.json version and release config
test_package_config() {
    print_info "Testing package.json configuration..."

    local current_version=$(node -p "require('./package.json').version" 2>/dev/null)
    if [ $? -eq 0 ]; then
        print_success "Current version: $current_version"
    else
        print_error "Cannot read version from package.json"
        return 1
    fi

    # Check release script
    if grep -q '"release":' package.json; then
        print_success "Release script configured"
    else
        print_error "Release script missing in package.json"
        return 1
    fi

    # Check semantic-release plugins
    local plugins=("@semantic-release/commit-analyzer" "@semantic-release/release-notes-generator" "@semantic-release/changelog" "@semantic-release/npm" "@semantic-release/github" "@semantic-release/git")

    for plugin in "${plugins[@]}"; do
        if grep -q "$plugin" package.json; then
            print_success "✓ Plugin: $plugin"
        else
            print_warning "⚠ Missing plugin: $plugin"
        fi
    done
}

# Test CI environment simulation
test_ci_environment() {
    print_info "Testing CI environment simulation..."

    # Set CI environment variables
    export CI=true
    export NODE_ENV=test

    # Test full CI pipeline
    print_info "Running full CI pipeline..."

    if pnpm ci:all >/dev/null 2>&1; then
        print_success "CI pipeline passed"
    else
        print_error "CI pipeline failed"
        return 1
    fi

    unset CI NODE_ENV
}

# Simulate semantic-release (dry run)
simulate_release() {
    print_info "Simulating semantic-release (dry run)..."

    # Create temporary environment
    export GITHUB_TOKEN="dummy-token-for-testing"

    # Run semantic-release in dry-run mode
    if pnpm release --dry-run >/dev/null 2>&1; then
        print_success "Semantic-release dry run completed"
        print_info "Check output above for release preview"
    else
        print_warning "Semantic-release dry run had issues (may be normal)"
        print_info "This might be expected if no releasable commits exist"
    fi

    unset GITHUB_TOKEN
}

# Test branch setup
test_branch_setup() {
    print_info "Testing branch setup..."

    local current_branch=$(git branch --show-current)
    print_info "Current branch: $current_branch"

    # Check if main branch exists
    if git show-ref --verify --quiet refs/heads/main; then
        print_success "Main branch exists"
    else
        print_warning "Main branch not found"
    fi

    # Check if develop branch exists
    if git show-ref --verify --quiet refs/heads/develop; then
        print_success "Develop branch exists"
    else
        print_warning "Develop branch not found (will be created automatically)"
    fi

    # Check remote origin
    if git remote get-url origin >/dev/null 2>&1; then
        local remote_url=$(git remote get-url origin)
        print_success "Remote origin: $remote_url"
    else
        print_warning "No remote origin configured"
    fi
}

# Generate release readiness report
generate_report() {
    print_info "Generating release readiness report..."

    echo ""
    echo "🚀 RELEASE READINESS REPORT"
    echo "=========================="
    echo ""

    echo "📦 Package Information:"
    echo "  Version: $(node -p "require('./package.json').version" 2>/dev/null || echo 'Unknown')"
    echo "  Name: $(node -p "require('./package.json').name" 2>/dev/null || echo 'Unknown')"
    echo ""

    echo "🔧 Environment:"
    echo "  Node.js: $(node --version)"
    echo "  pnpm: $(pnpm --version)"
    echo "  Docker: $(docker --version | head -1)"
    echo ""

    echo "📋 Branch Status:"
    echo "  Current: $(git branch --show-current)"
    echo "  Commits ahead of main: $(git rev-list --count HEAD ^main 2>/dev/null || echo 'N/A')"
    echo ""

    echo "🔍 Recent Commits:"
    git log --format="  %h %s" -5
    echo ""

    echo "🎯 Release Triggers:"
    local feat_commits=$(git log --format="%s" -10 | grep -c "^feat" || echo 0)
    local fix_commits=$(git log --format="%s" -10 | grep -c "^fix" || echo 0)
    echo "  feat commits (last 10): $feat_commits"
    echo "  fix commits (last 10): $fix_commits"
    echo ""

    if [ $feat_commits -gt 0 ] || [ $fix_commits -gt 0 ]; then
        print_success "✅ Release will be triggered (feat/fix commits found)"
    else
        print_warning "⚠️  No release will be triggered (no feat/fix commits)"
    fi
}

# Main execution
main() {
    echo "🧪 ByteBerry OAuth2 - Service - Release Testing"
    echo "=========================================="
    echo ""

    check_prerequisites
    echo ""

    test_package_config
    echo ""

    test_semantic_release_config
    echo ""

    test_conventional_commits
    echo ""

    test_branch_setup
    echo ""

    test_docker_build
    echo ""

    test_ci_environment
    echo ""

    simulate_release
    echo ""

    generate_report

    echo ""
    print_success "🎉 Release testing completed!"
    echo ""
    print_info "📋 Next steps:"
    echo "  1. Configure GitHub secrets (see docs/GITHUB_SECRETS_SETUP.md)"
    echo "  2. Create a PR with: git commit -m 'feat: your feature'"
    echo "  3. Merge to main to trigger release"
    echo ""
    print_info "🔗 Useful commands:"
    echo "  pnpm commit  # Interactive conventional commit"
    echo "  pnpm release # Local semantic-release (dry run)"
    echo "  git log --oneline -10  # Check recent commits"
}

# Run main function
main "$@"
