#!/bin/bash

cat <<-EOF | tee /opt/maxcpus
#!/bin/bash
echo \$1 | sudo tee /sys/devices/system/cpu/cpu1/online
EOF
chmod +x /opt/maxcpus

cat <<-EOF | tee /etc/systemd/system/maxcpus.service
[Unit]
Description=maxcpus

[Service]
User=root
Group=root
ExecStart=/opt/maxcpus 0
ExecStop=/opt/maxcpus 1

Restart=no
Type=oneshot
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

systemctl start maxcpus
systemctl enable maxcpus
