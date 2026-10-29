package com.farmfresh.backend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.io.Console;

public class PasswordHashGenerator {

    public static void main(String[] args) {
        Console console = System.console();

        if (console == null) {
            System.out.println(
                "Run this program in a terminal that supports password input."
            );
            return;
        }

        char[] password = console.readPassword("Enter new Admin password: ");

        try {
            String hash = new BCryptPasswordEncoder()
                    .encode(new String(password));

            System.out.println("BCrypt hash:");
            System.out.println(hash);
        } finally {
            java.util.Arrays.fill(password, '\0');
        }
    }
}