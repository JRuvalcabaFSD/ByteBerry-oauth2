#!/bin/bash

# ByteBerry OAuth2 - Service - Docker Testing Script
# Tests Docker image functionality and performance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
COMPOSE_FILE="docker-compose.test.yml"
SERVICE_NAME="oauth2-service"
TEST_PORT="4000"
HEALTH_ENDPOINT="http://localhost:${TEST_PORT}/health"
DEEP_HEALTH_ENDPOINT="http://localhost:${TEST_PORT}/health/deep"

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

# Cleanup function
cleanup() {
    print_info "Cleaning up test environment..."
    docker-compose -f ${COMPOSE_FILE} down -v --remove-orphans >/dev/null 2>&1 || true
    print_success "Cleanup completed"
}

# Build test image
build_test_image() {
    print_info "Building test image..."

    docker-compose -f ${COMPOSE_FILE} build --no-cache

    print_success "Test image built successfully"
}

# Start test container
start_container() {
    print_info "Starting test container..."

    docker-compose -f ${COMPOSE_FILE} up -d

    # Wait for container to be running
    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if docker-compose -f ${COMPOSE_FILE} ps ${SERVICE_NAME} | grep -q "Up"; then
            print_success "Container is running"
            return 0
        fi

        attempt=$((attempt + 1))
        print_info "Waiting for container to start... (${attempt}/${max_attempts})"
        sleep 2
    done

    print_error "Container failed to start within expected time"
    docker-compose -f ${COMPOSE_FILE} logs ${SERVICE_NAME}
    return 1
}

# Wait for service to be ready
wait_for_service() {
    print_info "Waiting for service to be ready..."

    local max_attempts=30
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -f -s ${HEALTH_ENDPOINT} >/dev/null 2>&1; then
            print_success "Service is ready and responding"
            return 0
        fi

        attempt=$((attempt + 1))
        print_info "Waiting for service... (${attempt}/${max_attempts})"
        sleep 2
    done

    print_error "Service did not become ready within expected time"
    return 1
}

# Test health endpoints
test_health_endpoints() {
    print_info "Testing health endpoints..."

    # Test basic health endpoint
    local health_response
    if health_response=$(curl -s -f ${HEALTH_ENDPOINT}); then
        if echo "${health_response}" | grep -q '"status":"healthy"'; then
            print_success "✅ Basic health check passed"
        else
            print_error "❌ Basic health check returned unhealthy status"
            echo "Response: ${health_response}"
            return 1
        fi
    else
        print_error "❌ Basic health endpoint failed"
        return 1
    fi

    # Test deep health endpoint
    local deep_health_response
    if deep_health_response=$(curl -s -f ${DEEP_HEALTH_ENDPOINT}); then
        if echo "${deep_health_response}" | grep -q '"status":"healthy"'; then
            print_success "✅ Deep health check passed"
        else
            print_warning "⚠️ Deep health check returned non-healthy status"
            echo "Response: ${deep_health_response}"
        fi
    else
        print_error "❌ Deep health endpoint failed"
        return 1
    fi
}

# Test Docker health check
test_docker_healthcheck() {
    print_info "Testing Docker health check..."

    # Wait for Docker health check to complete
    local max_attempts=20
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        local health_status
        health_status=$(docker-compose -f ${COMPOSE_FILE} ps -q ${SERVICE_NAME} | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null || echo "unknown")

        case "${health_status}" in
            "healthy")
                print_success "✅ Docker health check passed"
                return 0
                ;;
            "unhealthy")
                print_error "❌ Docker health check failed"
                return 1
                ;;
            "starting"|"unknown")
                print_info "Docker health check in progress... (${attempt}/${max_attempts})"
                ;;
        esac

        attempt=$((attempt + 1))
        sleep 3
    done

    print_warning "⚠️ Docker health check did not complete within expected time"
    return 1
}

# Test container resource usage
test_resource_usage() {
    print_info "Testing resource usage..."

    local container_id
    container_id=$(docker-compose -f ${COMPOSE_FILE} ps -q ${SERVICE_NAME})

    if [ -n "${container_id}" ]; then
        local stats
        stats=$(docker stats ${container_id} --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}")

        print_info "Resource usage:"
        echo "${stats}"

        # Extract memory usage (basic check)
        local mem_usage
        mem_usage=$(echo "${stats}" | tail -n 1 | awk '{print $2}' | cut -d'/' -f1)

        if echo "${mem_usage}" | grep -q "MB"; then
            local mem_value
            mem_value=$(echo "${mem_usage}" | sed 's/MB//' | sed 's/MiB//')
            if (( $(echo "${mem_value} < 300" | bc -l) )); then
                print_success "✅ Memory usage is within acceptable limits (${mem_usage})"
            else
                print_warning "⚠️ Memory usage is high (${mem_usage})"
            fi
        fi
    else
        print_warning "⚠️ Could not get container stats"
    fi
}

# Test API endpoints
test_api_endpoints() {
    print_info "Testing API endpoints..."

    # Test root endpoint
    local root_response
    if root_response=$(curl -s -f http://localhost:${TEST_PORT}/); then
        if echo "${root_response}" | grep -q '"service":"byteberry-oauth2"'; then
            print_success "✅ Root endpoint responding correctly"
        else
            print_warning "⚠️ Root endpoint response unexpected"
            echo "Response: ${root_response}"
        fi
    else
        print_error "❌ Root endpoint failed"
        return 1
    fi

    # Test 404 handling
    local not_found_response
    if not_found_response=$(curl -s http://localhost:${TEST_PORT}/nonexistent 2>/dev/null); then
        if echo "${not_found_response}" | grep -q '"error":"Not Found"'; then
            print_success "✅ 404 handling working correctly"
        else
            print_warning "⚠️ 404 handling response unexpected"
        fi
    fi
}

# Show container logs
show_logs() {
    print_info "Showing container logs (last 50 lines)..."
    docker-compose -f ${COMPOSE_FILE} logs --tail=50 ${SERVICE_NAME}
}

# Run comprehensive test suite
run_tests() {
    print_info "🚀 Starting ByteBerry OAuth2 Service Docker Tests"
    echo "=================================================="

    # Setup trap for cleanup
    trap cleanup EXIT

    # Build and start
    build_test_image || return 1
    start_container || return 1
    wait_for_service || return 1

    # Run tests
    local test_results=()

    test_health_endpoints && test_results+=("Health endpoints: ✅") || test_results+=("Health endpoints: ❌")
    test_docker_healthcheck && test_results+=("Docker healthcheck: ✅") || test_results+=("Docker healthcheck: ❌")
    test_resource_usage && test_results+=("Resource usage: ✅") || test_results+=("Resource usage: ❌")
    test_api_endpoints && test_results+=("API endpoints: ✅") || test_results+=("API endpoints: ❌")

    # Show results
    echo ""
    print_info "📊 Test Results Summary:"
    echo "========================"
    for result in "${test_results[@]}"; do
        echo "  ${result}"
    done

    # Show logs if any test failed
    if [[ " ${test_results[*]} " =~ " ❌ " ]]; then
        echo ""
        show_logs
        return 1
    fi

    echo ""
    print_success "🎉 All Docker tests passed!"
    return 0
}

# Show usage
usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  test      Run comprehensive test suite (default)"
    echo "  build     Build test image only"
    echo "  start     Start test container only"
    echo "  logs      Show container logs"
    echo "  cleanup   Clean up test environment"
    echo ""
}

# Main execution
main() {
    case "${1:-test}" in
        test)
            run_tests
            ;;
        build)
            build_test_image
            ;;
        start)
            build_test_image
            start_container
            wait_for_service
            print_info "Test environment ready. Access: http://localhost:${TEST_PORT}"
            print_info "Run 'docker-compose -f ${COMPOSE_FILE} down' to stop"
            ;;
        logs)
            show_logs
            ;;
        cleanup)
            cleanup
            ;;
        help|--help|-h)
            usage
            ;;
        *)
            print_error "Unknown command: ${1}"
            usage
            exit 1
            ;;
    esac
}

# Check prerequisites
if ! command -v docker >/dev/null 2>&1; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

if ! command -v docker-compose >/dev/null 2>&1; then
    print_error "Docker Compose is not installed or not in PATH"
    exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
    print_error "curl is required for testing endpoints"
    exit 1
fi

# Execute main function
main "$@"
