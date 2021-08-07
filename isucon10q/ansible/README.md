# ansible
- See: https://github.com/isucon/isucon10-qualify/tree/master/provisioning/ansible

## 注意点
- Rust install時にlexical-coreのcompileが失敗する
  - make build前にcargo update -p lexical-core
- Apacheが動いていてnginxの起動が失敗する
  - nginx起動前にsudo systemctl stop apache2
