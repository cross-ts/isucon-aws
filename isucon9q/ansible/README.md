# ansible
- See: https://github.com/isucon/isucon9-qualify/tree/master/provisioning
- aliyunをコメントアウト
- あえてUbuntu20.04で構築しているため下記が必要
  - sudo apt install acl
- 画像類の事前準備はドキュメントに書いてある通りで
- SSL証明書の期限切れのためベンチマークが失敗する
  - ベンチマーカ側でTLSClientConfigに `InsecureSkipVerify: true` を追加して通す
