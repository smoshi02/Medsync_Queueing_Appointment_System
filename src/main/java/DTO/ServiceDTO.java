package DTO;

import jakarta.validation.constraints.NotBlank;

public class ServiceDTO {
    private Long serviceId;
    @NotBlank(message = "Service name is required")
    private String serviceName;

    @NotBlank(message = "Service category is required")
    private String serviceCategory;

    @NotBlank(message = "Service status is required")
    private String serviceStatus;

    public ServiceDTO() {}

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getServiceCategory() {
        return serviceCategory;
    }

    public void setServiceCategory(String serviceCategory) {
        this.serviceCategory = serviceCategory;
    }

    public String getServiceStatus() {
        return serviceStatus;
    }

    public void setServiceStatus(String serviceStatus) {
        this.serviceStatus = serviceStatus;
    }
}
