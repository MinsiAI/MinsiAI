package ai.minsi.util;

public final class EmailMasker {

    private EmailMasker() {
    }

    public static String mask(String email) {
        if (email == null || email.isBlank()) {
            return "";
        }

        int atIndex = email.indexOf('@');
        if (atIndex <= 0) {
            return "***";
        }

        String local = email.substring(0, atIndex);
        String domain = email.substring(atIndex + 1);
        String visibleLocal = local.substring(0, 1);

        return visibleLocal + "***@" + domain;
    }
}
