package myapp;
import java.awt.*;
import javax.swing.*;
public class JobPortalGUI extends JFrame{private final AuthService auth=new AuthService();
    public JobPortalGUI(){super("Job Portal");
    if(auth.isEmpty()){auth.register(new JobSeeker("seeker123","pass123","seeker123@example.com"));
    auth.register(new Employer("employerX","emp321","employerX@example.com"));
}
setDefaultCloseOperation(EXIT_ON_CLOSE);
setSize(380,140);
setLocationRelativeTo(null);
JPanel p=new JPanel(new GridLayout(1,3,6,6));
JButton b1=new JButton("Login"),b2=new JButton("Register"),b3=new JButton("Exit");
p.add(b1);
p.add(b2);
p.add(b3);
add(p);
b3.addActionListener(e->dispose());
b2.addActionListener(e->doRegister());
b1.addActionListener(e->doLogin());
}
private void doRegister(){String[] r={"Job Seeker","Employer"};
String role=(String)JOptionPane.showInputDialog(this,"Role:","Register",JOptionPane.PLAIN_MESSAGE,null,r,r[0]);
if(role==null) return;String u=JOptionPane.showInputDialog(this,"Username:");
if(u==null||u.isBlank())return;String e=JOptionPane.showInputDialog(this,"Email:");
if(e==null||!e.matches("\\S+@\\S+\\.\\S+")){JOptionPane.showMessageDialog(this,"Invalid email");
return;
}
String p=JOptionPane.showInputDialog(this,"Password:");
if(p==null) return;
if(role.equals("Job Seeker"))auth.register(new JobSeeker(u,p,e));
else auth.register(new Employer(u,p,e));
JOptionPane.showMessageDialog(this,"Registered. You can login.");
}
private void doLogin(){String u=JOptionPane.showInputDialog(this,"Username:");
if(u==null)return;
String p=JOptionPane.showInputDialog(this,"Password:");
if(p==null)return;
User usr=auth.login(u,p);
if(usr==null){JOptionPane.showMessageDialog(this,"Login failed");
return;
}
if(usr instanceof Employer)employerFlow((Employer)usr);else seekerFlow((JobSeeker)usr);
}
private void seekerFlow(JobSeeker s){java.util.List<Job> jobs=JobService.getInstance().getJobs();
    String[] items=jobs.stream().map(Job::toString).toArray(String[]::new);
    JList<String> list=new JList<>(items);
    int sel=JOptionPane.showOptionDialog(this,new JScrollPane(list),"Jobs",JOptionPane.DEFAULT_OPTION,JOptionPane.PLAIN_MESSAGE,null,new Object[]{"Apply","Close"},"Close");
    if(sel==0){int idx=list.getSelectedIndex();
        if(idx<0)idx=0;Job j=jobs.get(idx);
        String cover=JOptionPane.showInputDialog(this,"Cover letter:");
        ApplicationService.getInstance().addApplication(new Application(s.getUsername(),s.getEmail(),j.getOwner(),j.getTitle(),cover));
        JOptionPane.showMessageDialog(this,"Applied");
    }
}
private void employerFlow(Employer e){String[] opts={"Add Job","View Applicants","Close"};
int c=JOptionPane.showOptionDialog(this,"Employer: "+e.getUsername(),"Employer",JOptionPane.DEFAULT_OPTION,JOptionPane.PLAIN_MESSAGE,null,opts,opts[0]);
if(c==0){String t=JOptionPane.showInputDialog(this,"Title:");
String d=JOptionPane.showInputDialog(this,"Description:");
if(t!=null&&d!=null){Job job=new Job(e.getUsername(),t,d);e.addJob(job);
        JOptionPane.showMessageDialog(this,"Job added");
    }
}
else if(c==1){java.util.List<Job> jobs=JobService.getInstance().getJobsByOwner(e.getUsername());
    StringBuilder sb=new StringBuilder();
    for(Job j:jobs){sb.append(j.getTitle()).append("\n");
    java.util.List<Application> apps=ApplicationService.getInstance().getApplicationsForJob(e.getUsername(),j.getTitle());
    if(apps.isEmpty()){sb.append("  (no applicants)\n\n");
    continue;
}
for(Application a:apps)sb.append("  - ").append(a.toString()).append("\n");
sb.append("\n");
}
JOptionPane.showMessageDialog(this,sb.length()==0?"No applications":sb.toString());
    }
}
public static void main(String[]a){javax.swing.SwingUtilities.invokeLater(()->new JobPortalGUI().setVisible(true));
}
}