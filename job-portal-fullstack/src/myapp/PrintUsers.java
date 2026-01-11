package myapp;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class PrintUsers {
    public static void main(String[] args) {
        SQLiteHelper h = SQLiteHelper.getInstance();
        try (Connection c = h.getConnection(); PreparedStatement ps = c.prepareStatement("SELECT username,email,password,role FROM users"); ResultSet rs = ps.executeQuery()) {
            System.out.println("username,email,password,role");
            while (rs.next()) {
                System.out.println(rs.getString(1) + "," + rs.getString(2) + "," + rs.getString(3) + "," + rs.getString(4));
            }
        } catch (SQLException e) {
            System.out.println("Failed to read users: " + e.getMessage());
            e.printStackTrace();
        }
    }
}