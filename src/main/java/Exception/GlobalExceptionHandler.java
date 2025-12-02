//package Exception;
//
//import ch.qos.logback.core.model.Model;
//import org.springframework.web.bind.annotation.ControllerAdvice;
//import org.springframework.web.bind.annotation.ExceptionHandler;
//
//@ControllerAdvice
//public class GlobalExceptionHandler {
//
//    @ExceptionHandler(ResourceNotFoundException.class)
//    public String handleResourceNotFound(ResourceNotFoundException ex, Model model) {
//        model.addAttribute("message", ex.getMessage());
//        return "error/error";
//    }
//
//    @ExceptionHandler(Exception.class)
//    public String handleGenericException(Exception ex, Model model) {
//        model.addAttribute("message", "Unexpected error: " + ex.getMessage());
//        return "error/error";
//    }
//}
